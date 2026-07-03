import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdjustmentsScreen extends StatelessWidget {
  const AdjustmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Solicitudes de ajuste'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        actions: [
          IconButton(icon: const Icon(Icons.add_rounded), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _AdjustmentCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            date: '28 Jun 2026',
            reason: 'Problema de salud',
            status: 'Aprobado',
            statusColor: Colors.green,
          ),
          const SizedBox(height: 8),
          _AdjustmentCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            date: '25 Jun 2026',
            reason: 'Olvidé registrar mi consumo',
            status: 'Pendiente',
            statusColor: Colors.orange,
          ),
          const SizedBox(height: 8),
          _AdjustmentCard(
            colorScheme: colorScheme,
            textTheme: textTheme,
            date: '20 Jun 2026',
            reason: 'Error del sistema',
            status: 'Rechazado',
            statusColor: Colors.red,
          ),
        ],
      ),
    );
  }
}

class _AdjustmentCard extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;
  final String date;
  final String reason;
  final String status;
  final Color statusColor;

  const _AdjustmentCard({required this.colorScheme, required this.textTheme, required this.date, required this.reason, required this.status, required this.statusColor});

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
                color: colorScheme.tertiaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.edit_note_rounded, color: colorScheme.onTertiaryContainer),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('$date — ', style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(status, style: textTheme.labelSmall?.copyWith(
                          color: statusColor, fontWeight: FontWeight.w600,
                        )),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(reason, style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
