import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PaymentsScreen extends StatelessWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de pagos'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _PaymentCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            date: '01 Jul 2026',
            amount: 'S/ 270.00',
            method: 'Efectivo',
            plan: 'Plan Mensual 30 Días',
          ),
          const SizedBox(height: 8),
          _PaymentCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            date: '01 Jun 2026',
            amount: 'S/ 270.00',
            method: 'Transferencia',
            plan: 'Plan Mensual 30 Días',
          ),
          const SizedBox(height: 8),
          _PaymentCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            date: '15 May 2026',
            amount: 'S/ 55.00',
            method: 'Efectivo',
            plan: 'Plan Semanal 5 Días',
          ),
        ],
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;
  final String date;
  final String amount;
  final String method;
  final String plan;

  const _PaymentCard({required this.colorScheme, required this.textTheme, required this.date, required this.amount, required this.method, required this.plan});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: colorScheme.secondaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.payments_rounded, color: colorScheme.onSecondaryContainer),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(amount, style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(plan, style: textTheme.bodySmall),
                  Text('$date • $method', style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
            Icon(Icons.check_circle, color: Colors.green.shade600, size: 20),
          ],
        ),
      ),
    );
  }
}
