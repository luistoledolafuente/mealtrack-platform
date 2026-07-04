import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';

class AdjustmentsScreen extends StatefulWidget {
  const AdjustmentsScreen({super.key});

  @override
  State<AdjustmentsScreen> createState() => _AdjustmentsScreenState();
}

class _AdjustmentsScreenState extends State<AdjustmentsScreen> {
  late Future<List<AdjustmentRequestModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<AdjustmentRepository>().getMyAdjustments();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Solicitudes de ajuste'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: FutureBuilder<List<AdjustmentRequestModel>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snap.data ?? [];
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.edit_note_rounded, size: 64, color: colorScheme.outline),
                  const SizedBox(height: 12),
                  Text('Sin solicitudes', style: textTheme.bodyLarge),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: items.map((a) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _AdjustmentCard(adjustment: a, colorScheme: colorScheme, textTheme: textTheme),
            )).toList(),
          );
        },
      ),
    );
  }
}

class _AdjustmentCard extends StatelessWidget {
  final AdjustmentRequestModel adjustment;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _AdjustmentCard({required this.adjustment, required this.colorScheme, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    final statusColor = adjustment.status == 'approved' ? Colors.green
        : adjustment.status == 'rejected' ? Colors.red
        : Colors.orange;
    final statusLabel = adjustment.status == 'approved' ? 'Aprobado'
        : adjustment.status == 'rejected' ? 'Rechazado'
        : 'Pendiente';

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: colorScheme.tertiaryContainer, borderRadius: BorderRadius.circular(12)),
              child: Icon(Icons.edit_note_rounded, color: colorScheme.onTertiaryContainer),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('${adjustment.createdAt.day}/${adjustment.createdAt.month}/${adjustment.createdAt.year}', style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                        child: Text(statusLabel, style: textTheme.labelSmall?.copyWith(color: statusColor, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(adjustment.reason, style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
