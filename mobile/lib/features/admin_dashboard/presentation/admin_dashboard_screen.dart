import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/widgets/animated_reveal.dart';

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
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = context.read<DashboardRepository>();
      final data = await repo.getAdminDashboard();
      if (mounted) {
        setState(() {
          _summary = data;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Error al cargar datos';
          _loading = false;
        });
      }
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
                      FilledButton.tonal(
                          onPressed: _load, child: const Text('Reintentar')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AnimatedReveal(
                            child: _SummaryGrid(
                                summary: _summary!, colorScheme: colorScheme)),
                        const SizedBox(height: 24),
                        Text('Gestión', style: textTheme.titleLarge),
                        const SizedBox(height: 12),
                        AnimatedReveal(
                            delay: const Duration(milliseconds: 80),
                            child: _ManagementGrid(
                              showAudit:
                                  context.watch<AuthProvider>().isSuperadmin,
                            )),
                      ],
                    ),
                  ),
                ),
    );
  }
}

class _SummaryGrid extends StatelessWidget {
  final DashboardSummaryModel summary;
  final ColorScheme colorScheme;

  const _SummaryGrid({required this.summary, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    final cards = [
      _SummaryCard(
          color: colorScheme.primaryContainer,
          textColor: colorScheme.onPrimaryContainer,
          icon: Icons.people_rounded,
          label: 'Estudiantes',
          value: '${summary.totalStudents}'),
      _SummaryCard(
          color: colorScheme.tertiaryContainer,
          textColor: colorScheme.onTertiaryContainer,
          icon: Icons.restaurant_rounded,
          label: 'Consumos hoy',
          value: '${summary.todayConsumed}'),
      _SummaryCard(
          color: colorScheme.errorContainer,
          textColor: colorScheme.onErrorContainer,
          icon: Icons.pending_actions_rounded,
          label: 'Ajustes pendientes',
          value: '${summary.pendingAdjustments}'),
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 620 ? 3 : 2;
        const gap = 12.0;
        final width = (constraints.maxWidth - gap * (columns - 1)) / columns;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [
            for (final card in cards) SizedBox(width: width, child: card)
          ],
        );
      },
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final Color color;
  final Color textColor;
  final IconData icon;
  final String label;
  final String value;
  const _SummaryCard(
      {required this.color,
      required this.textColor,
      required this.icon,
      required this.label,
      required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: color,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: textColor, size: 24),
          const SizedBox(height: 16),
          Text(value,
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.bold, color: textColor)),
          const SizedBox(height: 2),
          Text(label,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: textColor)),
        ]),
      ),
    );
  }
}

class _ManagementGrid extends StatelessWidget {
  final bool showAudit;
  const _ManagementGrid({required this.showAudit});

  @override
  Widget build(BuildContext context) {
    final items = [
      const _ActionItem(
          icon: Icons.person_add_alt_1_rounded,
          label: 'Agregar estudiante',
          route: RouteNames.addStudentPath),
      const _ActionItem(
          icon: Icons.calendar_month_rounded,
          label: 'Validar consumos',
          route: RouteNames.mealCalendarPath),
      const _ActionItem(
          icon: Icons.people_rounded,
          label: 'Estudiantes',
          route: RouteNames.subscriptionsPath),
      const _ActionItem(
          icon: Icons.payments_rounded,
          label: 'Pagos',
          route: RouteNames.paymentsPath),
      const _ActionItem(
          icon: Icons.edit_note_rounded,
          label: 'Solicitudes',
          route: RouteNames.adjustmentsPath),
      if (showAudit)
        const _ActionItem(
            icon: Icons.history_rounded,
            label: 'Auditoría',
            route: RouteNames.auditPath),
      const _ActionItem(
          icon: Icons.qr_code_scanner_rounded,
          label: 'Validar QR',
          route: RouteNames.qrValidatePath),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 620 ? 4 : 2;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: columns,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: columns == 4 ? 1 : 1.35),
          itemCount: items.length,
          itemBuilder: (_, index) => _ActionCard(item: items[index]),
        );
      },
    );
  }
}

class _ActionItem {
  final IconData icon;
  final String label;
  final String route;
  const _ActionItem(
      {required this.icon, required this.label, required this.route});
}

class _ActionCard extends StatelessWidget {
  final _ActionItem item;
  const _ActionCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        onTap: item.route.isEmpty ? null : () => context.push(item.route),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                      color: scheme.primaryContainer,
                      borderRadius: BorderRadius.circular(15)),
                  child: Icon(item.icon,
                      color: scheme.onPrimaryContainer, size: 25)),
              const SizedBox(height: 12),
              Text(item.label,
                  style: Theme.of(context).textTheme.labelLarge,
                  textAlign: TextAlign.center,
                  maxLines: 2),
            ],
          ),
        ),
      ),
    );
  }
}
