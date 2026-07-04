import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';
import '../../../shared/helpers/format_helpers.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  late Future<List<PaymentModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<PaymentRepository>().getMyPayments();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de pagos'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: FutureBuilder<List<PaymentModel>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final payments = snap.data ?? [];
          if (payments.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.payments_rounded, size: 64, color: colorScheme.outline),
                  const SizedBox(height: 12),
                  Text('Sin pagos registrados', style: textTheme.bodyLarge),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: payments.map((p) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _PaymentCard(payment: p, colorScheme: colorScheme, textTheme: textTheme),
            )).toList(),
          );
        },
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final PaymentModel payment;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _PaymentCard({required this.payment, required this.colorScheme, required this.textTheme});

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
              decoration: BoxDecoration(color: colorScheme.secondaryContainer, borderRadius: BorderRadius.circular(12)),
              child: Icon(Icons.payments_rounded, color: colorScheme.onSecondaryContainer),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(FormatHelpers.currency(payment.amount), style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text('${payment.paymentDate.day}/${payment.paymentDate.month}/${payment.paymentDate.year}', style: textTheme.bodySmall),
                  Text(FormatHelpers.paymentMethod(payment.paymentMethod), style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
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
