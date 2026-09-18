import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/providers/auth_provider.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  StudentDashboardModel? _dashboard;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final repo = context.read<DashboardRepository>();
      final data = await repo.getStudentDashboard();
      if (mounted) setState(() { _dashboard = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Error al cargar datos'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: Text('Hola, ${user?.fullName.split(' ').first ?? ''}'),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.notifications_outlined),
                if ((_dashboard?.pendingNotifications ?? 0) > 0)
                  Positioned(
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                      child: Text('${_dashboard!.pendingNotifications}',
                          style: const TextStyle(fontSize: 10, color: Colors.white)),
                    ),
                  ),
              ],
            ),
            onPressed: () => context.push(RouteNames.notificationsPath),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () async => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!, style: textTheme.bodyLarge),
                      const SizedBox(height: 12),
                      FilledButton.tonal(onPressed: _load, child: const Text('Reintentar')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_dashboard!.activeSubscription != null)
                          _SubscriptionCard(
                            subscription: _dashboard!.activeSubscription!,
                            colorScheme: colorScheme,
                            textTheme: textTheme,
                          ),
                        if (_dashboard!.activeSubscription != null) const SizedBox(height: 24),
                        _TodayMealCard(
                          todayMeal: _dashboard!.todayMeal,
                          colorScheme: colorScheme,
                          textTheme: textTheme,
                        ),
                        const SizedBox(height: 24),
                        Text('Acceso rápido', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 12),
                        _QuickActionsGrid(colorScheme: colorScheme),
                        const SizedBox(height: 24),
                        if (_dashboard!.recentMeals.isNotEmpty) ...[
                          Text('Consumos recientes', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._dashboard!.recentMeals.take(5).map((m) => _MealRow(meal: m, colorScheme: colorScheme)),
                        ],
                      ],
                    ),
                  ),
                ),
    );
  }
}

class _SubscriptionCard extends StatelessWidget {
  final SubscriptionModel subscription;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _SubscriptionCard({required this.subscription, required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: colorScheme.primaryContainer,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.receipt_long_rounded, color: colorScheme.onPrimaryContainer),
                const SizedBox(width: 8),
                Text('Suscripción activa', style: textTheme.labelLarge?.copyWith(color: colorScheme.onPrimaryContainer)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${subscription.remainingDays} días restantes', style: textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onPrimaryContainer,
                      )),
                      const SizedBox(height: 4),
                      Text(subscription.mealPlanName, style: textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onPrimaryContainer.withValues(alpha: 0.8),
                      )),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: colorScheme.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text('Activo', style: textTheme.labelSmall?.copyWith(
                    color: colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.w600,
                  )),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: subscription.progress,
                backgroundColor: colorScheme.primary.withValues(alpha: 0.2),
                color: colorScheme.onPrimaryContainer,
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${subscription.contractedDays} días contratados', style: textTheme.bodySmall?.copyWith(
                  color: colorScheme.onPrimaryContainer.withValues(alpha: 0.7),
                )),
                ElevatedButton.icon(
                  onPressed: () => context.push('${RouteNames.qrIssuePath}?subId=${subscription.id}'),
                  icon: const Icon(Icons.qr_code_rounded, size: 18),
                  label: const Text('Mi QR'),
                  style: ElevatedButton.styleFrom(
                    foregroundColor: colorScheme.primary,
                    backgroundColor: colorScheme.surface,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TodayMealCard extends StatelessWidget {
  final DailyMealModel? todayMeal;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _TodayMealCard({this.todayMeal, required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    final hasMeal = todayMeal != null;
    final statusColor = todayMeal?.status == 'consumed' ? Colors.green
        : todayMeal?.status == 'justified' ? Colors.orange
        : todayMeal?.status == 'not_consumed' ? Colors.red
        : todayMeal?.status == 'adjusted' ? Colors.blue
        : colorScheme.primary;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 56, height: 56,
              decoration: BoxDecoration(
                color: hasMeal ? statusColor.withValues(alpha: 0.15) : colorScheme.tertiaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                hasMeal ? Icons.check_circle_rounded : Icons.restaurant_rounded,
                color: hasMeal ? statusColor : colorScheme.onTertiaryContainer,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Almuerzo de hoy', style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(
                    hasMeal ? _statusLabel(todayMeal!.status) : 'No has registrado consumo hoy',
                    style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
            if (!hasMeal)
              TextButton(
                onPressed: () => context.push(RouteNames.mealCalendarPath),
                child: const Text('Registrar'),
              ),
          ],
        ),
      ),
    );
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'consumed': return 'Consumido';
      case 'not_consumed': return 'No consumido';
      case 'justified': return 'Justificado';
      case 'pending': return 'Pendiente';
      case 'adjusted': return 'Ajustado';
      default: return s;
    }
  }
}

class _QuickActionsGrid extends StatelessWidget {
  final ColorScheme colorScheme;
  const _QuickActionsGrid({required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    const items = [
      _ActionItem(icon: Icons.calendar_month_rounded, label: 'Calendario', route: RouteNames.mealCalendarPath),
      _ActionItem(icon: Icons.receipt_rounded, label: 'Suscripciones', route: RouteNames.subscriptionsPath),
      _ActionItem(icon: Icons.payments_rounded, label: 'Pagos', route: RouteNames.paymentsPath),
      _ActionItem(icon: Icons.edit_note_rounded, label: 'Ajustes', route: RouteNames.adjustmentsPath),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 0.8),
      itemCount: items.length,
      itemBuilder: (_, i) => _ActionChip(item: items[i]),
    );
  }
}

class _ActionItem {
  final IconData icon; final String label; final String route;
  const _ActionItem({required this.icon, required this.label, required this.route});
}

class _ActionChip extends StatelessWidget {
  final _ActionItem item;
  const _ActionChip({required this.item});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push(item.route),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(border: Border.all(color: Theme.of(context).colorScheme.outlineVariant), borderRadius: BorderRadius.circular(12)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(item.icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 4),
            Text(item.label, style: Theme.of(context).textTheme.labelSmall, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _MealRow extends StatelessWidget {
  final DailyMealModel meal;
  final ColorScheme colorScheme;
  const _MealRow({required this.meal, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    final color = meal.status == 'consumed' ? Colors.green
        : meal.status == 'justified' ? Colors.orange
        : meal.status == 'not_consumed' ? Colors.red
        : meal.status == 'adjusted' ? Colors.blue
        : Colors.grey;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Icon(Icons.circle, color: color, size: 10),
            const SizedBox(width: 12),
            Text('${meal.date.day}/${meal.date.month}/${meal.date.year}', style: Theme.of(context).textTheme.bodyMedium),
            const Spacer(),
            Text(_label(meal.status), style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }

  String _label(String s) {
    switch (s) {
      case 'consumed': return 'Consumido';
      case 'not_consumed': return 'No consumido';
      case 'justified': return 'Justificado';
      case 'adjusted': return 'Ajustado';
      default: return s;
    }
  }
}
