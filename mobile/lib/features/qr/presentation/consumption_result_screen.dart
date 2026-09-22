import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routes/route_names.dart';
import '../domain/consumption_result_model.dart';

class ConsumptionResultScreen extends StatelessWidget {
  final ConsumptionResultModel result;

  const ConsumptionResultScreen({
    super.key,
    required this.result,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    final isSuccess = result.success;
    final primaryColor = isSuccess ? Colors.green.shade700 : colorScheme.error;
    final containerColor = isSuccess
        ? Colors.green.shade50
        : colorScheme.errorContainer.withValues(alpha: 0.5);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resultado del Consumo'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: containerColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isSuccess ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  size: 88,
                  color: primaryColor,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                isSuccess ? '¡Consumo Registrado!' : 'No se pudo registrar',
                style: textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              if (!isSuccess)
                Text(
                  result.errorMessage ?? 'Ocurrió un error al procesar el código',
                  style: textTheme.bodyLarge?.copyWith(color: colorScheme.onSurfaceVariant),
                  textAlign: TextAlign.center,
                ),
              const SizedBox(height: 32),
              if (isSuccess) ...[
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    side: BorderSide(color: colorScheme.outlineVariant),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        _ResultRow(
                          icon: Icons.restaurant_menu_rounded,
                          label: 'Servicio',
                          value: result.serviceName.isNotEmpty ? result.serviceName : result.service,
                          textTheme: textTheme,
                        ),
                        const Divider(height: 24),
                        _ResultRow(
                          icon: Icons.account_balance_wallet_rounded,
                          label: 'Saldo restante',
                          value: '${result.remainingBalance} consumos',
                          valueColor: colorScheme.primary,
                          textTheme: textTheme,
                        ),
                        const Divider(height: 24),
                        _ResultRow(
                          icon: Icons.store_rounded,
                          label: 'Restaurante',
                          value: result.restaurantName.isNotEmpty
                              ? result.restaurantName
                              : 'Restaurante Central',
                          textTheme: textTheme,
                        ),
                        if (result.branchName != null && result.branchName!.isNotEmpty) ...[
                          const Divider(height: 24),
                          _ResultRow(
                            icon: Icons.location_on_rounded,
                            label: 'Sucursal',
                            value: result.branchName!,
                            textTheme: textTheme,
                          ),
                        ],
                        const Divider(height: 24),
                        _ResultRow(
                          icon: Icons.access_time_rounded,
                          label: 'Fecha y hora',
                          value: _formatDate(result.timestamp),
                          textTheme: textTheme,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  key: const Key('finish_result_btn'),
                  onPressed: () {
                    if (context.canPop()) {
                      context.pop();
                    } else {
                      context.go(RouteNames.pensionSummaryPath);
                    }
                  },
                  child: Text(isSuccess ? 'Volver al resumen' : 'Entendido'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}

class _ResultRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  final TextTheme textTheme;

  const _ResultRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 10),
        Text(label, style: textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant)),
        const Spacer(),
        Text(
          value,
          style: textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
