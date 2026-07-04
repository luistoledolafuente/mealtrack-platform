import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/repositories/repositories.dart';

class QrIssueScreen extends StatefulWidget {
  const QrIssueScreen({super.key});

  @override
  State<QrIssueScreen> createState() => _QrIssueScreenState();
}

class _QrIssueScreenState extends State<QrIssueScreen> {
  final _subscriptionController = TextEditingController();
  bool _loading = false;
  Map<String, dynamic>? _result;
  String? _error;

  @override
  void dispose() {
    _subscriptionController.dispose();
    super.dispose();
  }

  Future<void> _issue() async {
    final subId = _subscriptionController.text.trim();
    if (subId.isEmpty) return;

    setState(() { _loading = true; _error = null; _result = null; });

    try {
      final data = await context.read<QrRepository>().issueQr(subId);
      if (mounted) setState(() { _result = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Error al generar QR'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Generar QR'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(Icons.qr_code_2_rounded, size: 80, color: colorScheme.primary),
            const SizedBox(height: 16),
            Text('Generar código QR para validar consumo', style: textTheme.bodyLarge, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            TextField(
              controller: _subscriptionController,
              decoration: const InputDecoration(
                labelText: 'ID de suscripción',
                prefixIcon: Icon(Icons.receipt_long_rounded),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                onPressed: _loading ? null : _issue,
                icon: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.qr_code_rounded),
                label: Text(_loading ? 'Generando...' : 'Generar QR'),
              ),
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: colorScheme.errorContainer, borderRadius: BorderRadius.circular(12)),
                child: Text(_error!, style: textTheme.bodyMedium?.copyWith(color: colorScheme.onErrorContainer)),
              ),
            if (_result != null)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: colorScheme.primaryContainer, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  children: [
                    Icon(Icons.qr_code_rounded, size: 120, color: colorScheme.onPrimaryContainer),
                    const SizedBox(height: 12),
                    Text('Código generado', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: colorScheme.surface, borderRadius: BorderRadius.circular(8)),
                      child: SelectableText(_result!['token'] as String? ?? '', style: textTheme.bodySmall),
                    ),
                    const SizedBox(height: 8),
                    Text('Válido por: ${_result!['expiresIn'] as String? ?? 'N/A'}', style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
