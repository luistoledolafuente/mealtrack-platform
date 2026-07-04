import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/repositories/repositories.dart';

class AuditScreen extends StatefulWidget {
  const AuditScreen({super.key});

  @override
  State<AuditScreen> createState() => _AuditScreenState();
}

class _AuditScreenState extends State<AuditScreen> {
  late Future<List> _logsFuture;

  @override
  void initState() {
    super.initState();
    _logsFuture = _loadLogs();
  }

  Future<List> _loadLogs() async {
    final repo = context.read<AuditRepository>();
    return repo.getAuditLogs();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registro de auditoría'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: FutureBuilder<List>(
        future: _logsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline, size: 48, color: colorScheme.error),
                  const SizedBox(height: 8),
                  Text('Error al cargar auditoría'),
                  const SizedBox(height: 8),
                  FilledButton.tonal(onPressed: () => setState(() => _logsFuture = _loadLogs()), child: const Text('Reintentar')),
                ],
              ),
            );
          }
          final logs = snapshot.data ?? [];
          if (logs.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.history_rounded, size: 64, color: colorScheme.outline),
                  const SizedBox(height: 12),
                  Text('Sin registros de auditoría', style: Theme.of(context).textTheme.bodyLarge),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: logs.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (_, i) {
              final log = logs[i];
              return ListTile(
                leading: _actionIcon(log.action, colorScheme),
                title: Text(log.action, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                subtitle: Text('${log.entity} #${log.entityId.substring(0, 8)}…\n${_formatDate(log.createdAt)}'),
                trailing: Text(log.userId.substring(0, 8), style: Theme.of(context).textTheme.bodySmall),
                contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              );
            },
          );
        },
      ),
    );
  }

  Widget _actionIcon(String action, ColorScheme cs) {
    IconData icon;
    Color color;
    switch (action) {
      case 'CREATE':
        icon = Icons.add_circle_outline;
        color = Colors.green;
      case 'UPDATE':
        icon = Icons.edit_outlined;
        color = Colors.blue;
      case 'DELETE':
        icon = Icons.delete_outline;
        color = Colors.red;
      case 'APPROVE':
        icon = Icons.check_circle_outline;
        color = Colors.green;
      case 'REJECT':
        icon = Icons.cancel_outlined;
        color = Colors.red;
      case 'VALIDATE':
        icon = Icons.qr_code_scanner;
        color = Colors.orange;
      default:
        icon = Icons.info_outline;
        color = cs.onSurfaceVariant;
    }
    return Container(
      width: 40, height: 40,
      decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: color, size: 22),
    );
  }

  String _formatDate(DateTime d) => '${d.day}/${d.month}/${d.year} ${d.hour}:${d.minute.toString().padLeft(2, '0')}';
}
