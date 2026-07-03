import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Suscripciones'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SubscriptionCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            planName: 'Plan Mensual 30 Días',
            status: 'Activo',
            remainingDays: 22,
            contractedDays: 30,
            startDate: '01 Jul 2026',
            endDate: '31 Jul 2026',
            price: 'S/ 270.00',
          ),
          const SizedBox(height: 12),
          _SubscriptionCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            planName: 'Plan Semanal 5 Días',
            status: 'Finalizado',
            remainingDays: 0,
            contractedDays: 5,
            startDate: '15 Jun 2026',
            endDate: '20 Jun 2026',
            price: 'S/ 55.00',
            isExpired: true,
          ),
        ],
      ),
    );
  }
}

class _SubscriptionCard extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;
  final String planName;
  final String status;
  final int remainingDays;
  final int contractedDays;
  final String startDate;
  final String endDate;
  final String price;
  final bool isExpired;

  const _SubscriptionCard({
    required this.colorScheme,
    required this.textTheme,
    required this.planName,
    required this.status,
    required this.remainingDays,
    required this.contractedDays,
    required this.startDate,
    required this.endDate,
    required this.price,
    this.isExpired = false,
  });

  @override
  Widget build(BuildContext context) {
    final containerColor = isExpired ? colorScheme.surfaceContainerLow : colorScheme.primaryContainer;
    final onColor = isExpired ? colorScheme.onSurfaceVariant : colorScheme.onPrimaryContainer;

    return Card(
      elevation: 0,
      color: containerColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(planName, style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isExpired ? colorScheme.outlineVariant : colorScheme.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(status, style: textTheme.labelSmall?.copyWith(
                    color: onColor, fontWeight: FontWeight.w600,
                  )),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text('\$$remainingDays / $contractedDays días restantes', style: textTheme.bodyMedium),
            const SizedBox(height: 4),
            Text('$startDate → $endDate', style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
            const SizedBox(height: 4),
            Text(price, style: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.bold, color: onColor)),
          ],
        ),
      ),
    );
  }
}
