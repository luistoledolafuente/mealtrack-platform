import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/providers/auth_provider.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  DashboardSummaryModel? _summary;
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
      final data = await repo.getAdminDashboard();
      if (mounted) setState(() { _summary = data; _loading = false; });
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
        title: Text('Admin • ${user?.fullName.split(' ').first ?? ''}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
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
                        Row(
                          children: [
                            Expanded(child: _SummaryCard(
                              color: colorScheme.primaryContainer,
                              textColor: colorScheme.onPrimaryContainer,
                              icon: Icons.people_rounded,
                              label: 'Estudiantes',
                              value: '${_summary?.totalStudents ?? 0}',
                            )),
                            const SizedBox(width: 12),
                            Expanded(child: _SummaryCard(
                              color: colorScheme.tertiaryContainer,
                              textColor: colorScheme.onTertiaryContainer,
                              icon: Icons.restaurant_rounded,
                              label: 'Consumos hoy',
                              value: '${_summary?.todayConsumed ?? 0}',
                            )),
                            const SizedBox(width: 12),
                            Expanded(child: _SummaryCard(
                              color: colorScheme.errorContainer,
                              textColor: colorScheme.onErrorContainer,
                              icon: Icons.error_outline,
                              label: 'Ajustes pend.',
                              value: '${_summary?.pendingAdjustments ?? 0}',
                            )),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Text('Gestión', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 12),
                        _ManagementGrid(
                          colorScheme: colorScheme,
                          showAudit: context.watch<AuthProvider>().isSuperadmin,
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final Color color; final Color textColor; final IconData icon;
  final String label; final String value;
  const _SummaryCard({required this.color, required this.textColor, required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0, color: color,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Icon(icon, color: textColor, size: 28),
          const SizedBox(height: 8),
          Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: textColor)),
          Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: textColor)),
        ]),
      ),
    );
  }
}

class _ManagementGrid extends StatelessWidget {
  final ColorScheme colorScheme;
  final bool showAudit;
  const _ManagementGrid({required this.colorScheme, required this.showAudit});

  @override
  Widget build(BuildContext context) {
    final items = [
      const _ActionItem(icon: Icons.person_add_alt_1_rounded, label: 'Agregar estudiante', route: RouteNames.addStudentPath),
      const _ActionItem(icon: Icons.calendar_month_rounded, label: 'Validar consumos', route: RouteNames.mealCalendarPath),
      const _ActionItem(icon: Icons.people_rounded, label: 'Estudiantes', route: RouteNames.subscriptionsPath),
      const _ActionItem(icon: Icons.payments_rounded, label: 'Pagos', route: RouteNames.paymentsPath),
      const _ActionItem(icon: Icons.edit_note_rounded, label: 'Solicitudes', route: RouteNames.adjustmentsPath),
      if (showAudit)
        const _ActionItem(icon: Icons.history_rounded, label: 'Auditoría', route: RouteNames.auditPath),
      const _ActionItem(icon: Icons.qr_code_scanner_rounded, label: 'Validar QR', route: RouteNames.qrValidatePath),
    ];

    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 1),
      itemCount: items.length,
      itemBuilder: (_, i) => _ActionCard(item: items[i]),
    );
  }
}

class _ActionItem { final IconData icon; final String label; final String route; const _ActionItem({required this.icon, required this.label, required this.route}); }

class _ActionCard extends StatelessWidget {
  final _ActionItem item;
  const _ActionCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: item.route.isEmpty ? null : () => context.push(item.route),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(border: Border.all(color: Theme.of(context).colorScheme.outlineVariant), borderRadius: BorderRadius.circular(12)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(item.icon, color: Theme.of(context).colorScheme.primary, size: 32),
            const SizedBox(height: 8),
            Text(item.label, style: Theme.of(context).textTheme.labelMedium, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
