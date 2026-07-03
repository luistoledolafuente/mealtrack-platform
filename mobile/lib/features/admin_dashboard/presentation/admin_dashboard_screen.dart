import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/providers/auth_provider.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

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
            _SummaryRow(colorScheme: colorScheme, textTheme: textTheme),
            const SizedBox(height: 24),
            Text('Gestión', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            _ManagementGrid(colorScheme: colorScheme),
            const SizedBox(height: 24),
            Text('Resumen del día', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            _DailySummary(colorScheme: colorScheme, textTheme: textTheme),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _SummaryRow({required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _SummaryCard(
          color: colorScheme.primaryContainer,
          textColor: colorScheme.onPrimaryContainer,
          icon: Icons.people_rounded,
          label: 'Estudiantes',
          value: '48',
        )),
        const SizedBox(width: 12),
        Expanded(child: _SummaryCard(
          color: colorScheme.tertiaryContainer,
          textColor: colorScheme.onTertiaryContainer,
          icon: Icons.restaurant_rounded,
          label: 'Consumos hoy',
          value: '32',
        )),
        const SizedBox(width: 12),
        Expanded(child: _SummaryCard(
          color: colorScheme.errorContainer,
          textColor: colorScheme.onErrorContainer,
          icon: Icons.error_outline,
          label: 'Ajustes pend.',
          value: '3',
        )),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final Color color;
  final Color textColor;
  final IconData icon;
  final String label;
  final String value;

  const _SummaryCard({required this.color, required this.textColor, required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: color,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: textColor, size: 28),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: textColor,
            )),
            Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: textColor)),
          ],
        ),
      ),
    );
  }
}

class _ManagementGrid extends StatelessWidget {
  final ColorScheme colorScheme;

  const _ManagementGrid({required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    final items = [
      _ActionItem(icon: Icons.calendar_month_rounded, label: 'Validar consumos', route: RouteNames.mealCalendarPath),
      _ActionItem(icon: Icons.fastfood_rounded, label: 'Planes de comida', route: RouteNames.mealCalendarPath),
      _ActionItem(icon: Icons.people_rounded, label: 'Estudiantes', route: RouteNames.subscriptionsPath),
      _ActionItem(icon: Icons.payments_rounded, label: 'Pagos', route: RouteNames.paymentsPath),
      _ActionItem(icon: Icons.edit_note_rounded, label: 'Solicitudes', route: RouteNames.adjustmentsPath),
      _ActionItem(icon: Icons.history_rounded, label: 'Auditoría', route: RouteNames.auditPath),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemCount: items.length,
      itemBuilder: (_, i) => _ActionCard(item: items[i]),
    );
  }
}

class _ActionItem {
  final IconData icon;
  final String label;
  final String route;
  const _ActionItem({required this.icon, required this.label, required this.route});
}

class _ActionCard extends StatelessWidget {
  final _ActionItem item;
  const _ActionCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push(item.route),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
          borderRadius: BorderRadius.circular(12),
        ),
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

class _DailySummary extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _DailySummary({required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _SummaryRowItem(label: 'Consumidos hoy', value: '28', color: Colors.green),
            const Divider(height: 20),
            _SummaryRowItem(label: 'Sin registrar', value: '12', color: Colors.orange),
            const Divider(height: 20),
            _SummaryRowItem(label: 'Ausentes justificados', value: '4', color: Colors.blue),
          ],
        ),
      ),
    );
  }
}

class _SummaryRowItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _SummaryRowItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 12),
        Expanded(child: Text(label, style: Theme.of(context).textTheme.bodyMedium)),
        Text(value, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
      ],
    );
  }
}
