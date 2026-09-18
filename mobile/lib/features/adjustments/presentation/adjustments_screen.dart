import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';
import '../../../shared/providers/auth_provider.dart';

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
    _refresh();
  }

  void _refresh() {
    _future = context.read<AdjustmentRepository>().getMyAdjustments();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final auth = context.watch<AuthProvider>();
    final isAdminUser = auth.isAdmin || auth.isSuperadmin;

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
              child: _AdjustmentCard(
                adjustment: a,
                colorScheme: colorScheme,
                textTheme: textTheme,
                isAdmin: isAdminUser,
                onRefresh: () {
                  setState(() {
                    _refresh();
                  });
                },
              ),
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
  final bool isAdmin;
  final VoidCallback onRefresh;

  const _AdjustmentCard({
    required this.adjustment,
    required this.colorScheme,
    required this.textTheme,
    required this.isAdmin,
    required this.onRefresh,
  });

  void _showReviewDialog(BuildContext context, String decision) {
    final controller = TextEditingController();
    final title = decision == 'approved' ? 'Aprobar Solicitud' : 'Rechazar Solicitud';
    final actionText = decision == 'approved' ? 'Aprobar' : 'Rechazar';
    final actionColor = decision == 'approved' ? Colors.green : Colors.red;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (adjustment.requesterName.isNotEmpty)
              Text('Estudiante: ${adjustment.requesterName}'),
            if (adjustment.mealDate != null)
              Text('Fecha consumo: ${adjustment.mealDate!.day}/${adjustment.mealDate!.month}/${adjustment.mealDate!.year}'),
            const SizedBox(height: 12),
            Text('Motivo: ${adjustment.reason}'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Notas de resolución (opcional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              final notes = controller.text.trim();
              final messenger = ScaffoldMessenger.of(context);
              final repo = context.read<AdjustmentRepository>();
              
              Navigator.pop(ctx);
              
              try {
                await repo.reviewAdjustment(
                  id: adjustment.id,
                  decision: decision,
                  resolutionNotes: notes.isNotEmpty ? notes : null,
                );
                
                messenger.showSnackBar(
                  SnackBar(content: Text('Solicitud ${decision == 'approved' ? 'aprobada' : 'rechazada'} correctamente')),
                );
                
                onRefresh();
              } catch (e) {
                messenger.showSnackBar(
                  const SnackBar(content: Text('Error al procesar la solicitud')),
                );
              }
            },
            style: FilledButton.styleFrom(backgroundColor: actionColor),
            child: Text(actionText),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = adjustment.status == 'approved' ? Colors.green
        : adjustment.status == 'rejected' ? Colors.red
        : Colors.orange;
    final statusLabel = adjustment.status == 'approved' ? 'Aprobado'
        : adjustment.status == 'rejected' ? 'Rechazado'
        : 'Pendiente';

    final displayDate = adjustment.mealDate != null
        ? 'Consumo: ${adjustment.mealDate!.day}/${adjustment.mealDate!.month}/${adjustment.mealDate!.year}'
        : 'Creado: ${adjustment.createdAt.day}/${adjustment.createdAt.month}/${adjustment.createdAt.year}';

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
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
                      if (isAdmin && adjustment.requesterName.isNotEmpty) ...[
                        Text(adjustment.requesterName, style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                      ],
                      Row(
                        children: [
                          Text(displayDate, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
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
            if (isAdmin && adjustment.status == 'pending') ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: () => _showReviewDialog(context, 'rejected'),
                    icon: const Icon(Icons.close_rounded, size: 18),
                    label: const Text('Rechazar'),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: () => _showReviewDialog(context, 'approved'),
                    icon: const Icon(Icons.check_rounded, size: 18),
                    label: const Text('Aprobar'),
                    style: FilledButton.styleFrom(backgroundColor: Colors.green),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
