import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/providers/auth_provider.dart';

class StudentDashboardScreen extends StatelessWidget {
  const StudentDashboardScreen({super.key});

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
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push(RouteNames.notificationsPath),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () async {
              await context.read<AuthProvider>().logout();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SubscriptionCard(colorScheme: colorScheme, textTheme: textTheme),
            const SizedBox(height: 24),
            _TodayMealCard(colorScheme: colorScheme, textTheme: textTheme),
            const SizedBox(height: 24),
            Text('Acceso rápido', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            _QuickActionsGrid(colorScheme: colorScheme),
            const SizedBox(height: 24),
            Text('Actividad reciente', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            _RecentActivity(colorScheme: colorScheme, textTheme: textTheme),
          ],
        ),
      ),
    );
  }
}

class _SubscriptionCard extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _SubscriptionCard({required this.colorScheme, required this.textTheme});

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
                      Text('22 días restantes', style: textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onPrimaryContainer,
                      )),
                      const SizedBox(height: 4),
                      Text('Plan Mensual 30 Días', style: textTheme.bodyMedium?.copyWith(
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
                value: 22 / 30,
                backgroundColor: colorScheme.primary.withValues(alpha: 0.2),
                color: colorScheme.onPrimaryContainer,
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),
            Text('30 días contratados', style: textTheme.bodySmall?.copyWith(
              color: colorScheme.onPrimaryContainer.withValues(alpha: 0.7),
            )),
          ],
        ),
      ),
    );
  }
}

class _TodayMealCard extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _TodayMealCard({required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: colorScheme.tertiaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.restaurant_rounded, color: colorScheme.onTertiaryContainer),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Almuerzo de hoy', style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('No has registrado consumo hoy', style: textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  )),
                ],
              ),
            ),
            TextButton(
              onPressed: () => context.push(RouteNames.mealCalendarPath),
              child: const Text('Registrar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionsGrid extends StatelessWidget {
  final ColorScheme colorScheme;

  const _QuickActionsGrid({required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _ActionItem(icon: Icons.calendar_month_rounded, label: 'Calendario', route: RouteNames.mealCalendarPath),
      _ActionItem(icon: Icons.receipt_rounded, label: 'Suscripciones', route: RouteNames.subscriptionsPath),
      _ActionItem(icon: Icons.payments_rounded, label: 'Pagos', route: RouteNames.paymentsPath),
      _ActionItem(icon: Icons.edit_note_rounded, label: 'Ajustes', route: RouteNames.adjustmentsPath),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 0.8,
      ),
      itemCount: actions.length,
      itemBuilder: (_, i) => _ActionChip(action: actions[i]),
    );
  }
}

class _ActionItem {
  final IconData icon;
  final String label;
  final String route;
  const _ActionItem({required this.icon, required this.label, required this.route});
}

class _ActionChip extends StatelessWidget {
  final _ActionItem action;
  const _ActionChip({required this.action});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push(action.route),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(action.icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 4),
            Text(action.label, style: Theme.of(context).textTheme.labelSmall, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _RecentActivity extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _RecentActivity({required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _ActivityRow(
              icon: Icons.check_circle,
              iconColor: Colors.green,
              title: 'Consumo registrado',
              subtitle: 'Almuerzo - 02 Jul 2026',
            ),
            const Divider(height: 24),
            _ActivityRow(
              icon: Icons.payment,
              iconColor: Colors.blue,
              title: 'Pago recibido',
              subtitle: 'S/ 270.00 - Plan Mensual',
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _ActivityRow({required this.icon, required this.iconColor, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
              Text(subtitle, style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              )),
            ],
          ),
        ),
      ],
    );
  }
}
