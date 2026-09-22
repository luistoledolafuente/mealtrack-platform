import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routes/route_names.dart';
import '../application/pension_provider.dart';
import '../domain/pension_models.dart';

class PensionSummaryScreen extends StatefulWidget {
  const PensionSummaryScreen({super.key});

  @override
  State<PensionSummaryScreen> createState() => _PensionSummaryScreenState();
}

class _PensionSummaryScreenState extends State<PensionSummaryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PensionProvider>().loadPensionSummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final provider = context.watch<PensionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resumen de Pensión'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: provider.loading
          ? const Center(child: CircularProgressIndicator())
          : provider.error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(provider.error!, style: textTheme.bodyLarge),
                      const SizedBox(height: 12),
                      FilledButton.tonal(
                        onPressed: () => context.read<PensionProvider>().loadPensionSummary(),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                )
              : provider.summary == null
                  ? const Center(child: Text('No hay datos de pensión'))
                  : RefreshIndicator(
                      onRefresh: () => context.read<PensionProvider>().loadPensionSummary(),
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _VigenciaCard(
                              summary: provider.summary!,
                              colorScheme: colorScheme,
                              textTheme: textTheme,
                            ),
                            const SizedBox(height: 20),
                            Text(
                              'Saldo por Servicio',
                              style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            _ServiceBalancesGrid(
                              balances: provider.summary!.serviceBalances,
                              colorScheme: colorScheme,
                              textTheme: textTheme,
                            ),
                            const SizedBox(height: 20),
                            if (provider.summary!.closureAlerts.isNotEmpty) ...[
                              Text(
                                'Alertas de Cierre del Restaurante',
                                style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 12),
                              ...provider.summary!.closureAlerts.map(
                                (alert) => _ClosureAlertCard(
                                  alert: alert,
                                  colorScheme: colorScheme,
                                  textTheme: textTheme,
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],
                            Text(
                              'Ausencias e Inasistencias',
                              style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            _AbsenceQuotaBanner(
                              used: provider.summary!.usedAbsences,
                              limit: provider.summary!.monthlyAbsenceLimit,
                              colorScheme: colorScheme,
                              textTheme: textTheme,
                            ),
                            const SizedBox(height: 12),
                            if (provider.summary!.absences.isEmpty)
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Text(
                                  'No tienes ausencias registradas este mes',
                                  style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
                                ),
                              )
                            else
                              ...provider.summary!.absences.map(
                                (abs) => _AbsenceRow(
                                  absence: abs,
                                  colorScheme: colorScheme,
                                  textTheme: textTheme,
                                ),
                              ),
                            const SizedBox(height: 80),
                          ],
                        ),
                      ),
                    ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton.icon(
            key: const Key('register_consumption_btn'),
            onPressed: () => context.push(RouteNames.studentQrScanPath),
            icon: const Icon(Icons.qr_code_scanner_rounded),
            label: const Text(
              'Registrar consumo',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }
}

class _VigenciaCard extends StatelessWidget {
  final PensionSummaryModel summary;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _VigenciaCard({
    required this.summary,
    required this.colorScheme,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    final active = summary.isActive;
    return Card(
      elevation: 0,
      color: active ? colorScheme.primaryContainer : colorScheme.errorContainer,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  summary.mealPlanName,
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: active ? colorScheme.onPrimaryContainer : colorScheme.onErrorContainer,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: active ? Colors.green.shade700 : colorScheme.error,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    active ? 'Vigente' : 'Inactiva',
                    style: textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              summary.restaurantName,
              style: textTheme.bodyMedium?.copyWith(
                color: active ? colorScheme.onPrimaryContainer.withValues(alpha: 0.8) : colorScheme.onErrorContainer,
              ),
            ),
            const Divider(height: 20),
            Row(
              children: [
                Icon(Icons.calendar_today_rounded, size: 16, color: active ? colorScheme.onPrimaryContainer : colorScheme.onErrorContainer),
                const SizedBox(width: 6),
                Text(
                  'Vigencia: ${_formatDate(summary.validityStartDate)} al ${_formatDate(summary.validityEndDate)}',
                  style: textTheme.bodySmall?.copyWith(
                    color: active ? colorScheme.onPrimaryContainer : colorScheme.onErrorContainer,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
}

class _ServiceBalancesGrid extends StatelessWidget {
  final List<ServiceBalance> balances;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _ServiceBalancesGrid({
    required this.balances,
    required this.colorScheme,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: balances.map((b) {
        final icon = b.service == 'breakfast'
            ? Icons.free_breakfast_rounded
            : b.service == 'lunch'
                ? Icons.lunch_dining_rounded
                : Icons.dinner_dining_rounded;

        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
            side: BorderSide(color: colorScheme.outlineVariant),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: b.included ? colorScheme.primaryContainer : colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: b.included ? colorScheme.primary : colorScheme.onSurfaceVariant),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        b.serviceName,
                        style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        b.included ? '${b.remainingCount} consumos disponibles' : 'No incluido en tu plan',
                        style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                if (b.included)
                  Text(
                    '${b.remainingCount}/${b.contractedCount}',
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: b.remainingCount > 0 ? colorScheme.primary : colorScheme.error,
                    ),
                  ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _ClosureAlertCard extends StatelessWidget {
  final RestaurantClosureAlert alert;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _ClosureAlertCard({
    required this.alert,
    required this.colorScheme,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.amber.shade50,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.amber.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.amber.shade900),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Cierre programado: ${alert.reason}',
                    style: textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.amber.shade900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Afecta servicios: ${alert.affectedServices.join(', ')}',
                    style: textTheme.bodySmall?.copyWith(color: Colors.amber.shade900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Vigencia extendida automáticamente por ${alert.validityExtendedDays} día(s).',
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.amber.shade900,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AbsenceQuotaBanner extends StatelessWidget {
  final int used;
  final int limit;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _AbsenceQuotaBanner({
    required this.used,
    required this.limit,
    required this.colorScheme,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Cuota mensual de ausencias justificadas:', style: textTheme.bodySmall),
          Text(
            '$used / $limit justificadas',
            style: textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold, color: colorScheme.primary),
          ),
        ],
      ),
    );
  }
}

class _AbsenceRow extends StatelessWidget {
  final AbsenceNoticeItem absence;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _AbsenceRow({
    required this.absence,
    required this.colorScheme,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = absence.status == 'approved'
        ? Colors.green
        : absence.status == 'rejected'
            ? Colors.red
            : Colors.orange;

    final statusText = absence.status == 'approved'
        ? 'Aprobada'
        : absence.status == 'rejected'
            ? 'Rechazada'
            : 'Pendiente';

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          children: [
            Icon(Icons.circle, size: 8, color: statusColor),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${_formatDate(absence.date)} - ${absence.service}',
                    style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  if (absence.reason.isNotEmpty)
                    Text(
                      absence.reason,
                      style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                statusText,
                style: textTheme.labelSmall?.copyWith(color: statusColor, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
}
