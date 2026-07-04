import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  late Future<List<SubscriptionModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<SubscriptionRepository>().getMySubscriptions();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Suscripciones'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: FutureBuilder<List<SubscriptionModel>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final subs = snap.data ?? [];
          if (subs.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.receipt_long_rounded, size: 64, color: colorScheme.outline),
                  const SizedBox(height: 12),
                  Text('Sin suscripciones activas', style: textTheme.bodyLarge),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: subs.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _SubscriptionCard(subscription: s, colorScheme: colorScheme, textTheme: textTheme),
            )).toList(),
          );
        },
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
    final expired = !subscription.isActive;
    final containerColor = expired ? colorScheme.surfaceContainerLow : colorScheme.primaryContainer;
    final onColor = expired ? colorScheme.onSurfaceVariant : colorScheme.onPrimaryContainer;

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
                Expanded(child: Text(subscription.mealPlanName, style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: expired ? colorScheme.outlineVariant : colorScheme.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(subscription.status, style: textTheme.labelSmall?.copyWith(color: onColor, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text('${subscription.remainingDays} / ${subscription.contractedDays} días restantes', style: textTheme.bodyMedium),
            const SizedBox(height: 4),
            Text('Inicio: ${subscription.startDate.day}/${subscription.startDate.month}/${subscription.startDate.year}', style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}
