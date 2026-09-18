import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/repositories/repositories.dart';

class QrValidateScreen extends StatefulWidget {
  const QrValidateScreen({super.key});

  @override
  State<QrValidateScreen> createState() => _QrValidateScreenState();
}

class _QrValidateScreenState extends State<QrValidateScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  Map<String, dynamic>? _result;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _validate() async {
    final token = _controller.text.trim();
    if (token.isEmpty) return;

    setState(() { _loading = true; _error = null; _result = null; });

    try {
      final data = await context.read<QrRepository>().validateQr(token);
      if (mounted) setState(() { _result = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'QR inválido o expirado'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Validar QR'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(Icons.qr_code_scanner_rounded, size: 80, color: colorScheme.primary),
            const SizedBox(height: 16),
            Text('Ingresa el código QR del estudiante', style: textTheme.bodyLarge, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                labelText: 'Código QR',
                prefixIcon: Icon(Icons.qr_code_rounded),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                onPressed: _loading ? null : _validate,
                icon: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.search_rounded),
                label: Text(_loading ? 'Validando...' : 'Validar QR'),
              ),
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: colorScheme.errorContainer, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    Icon(Icons.cancel_rounded, color: colorScheme.onErrorContainer),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: textTheme.bodyMedium?.copyWith(color: colorScheme.onErrorContainer))),
                  ],
                ),
              ),
            if (_result != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: colorScheme.primaryContainer, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  children: [
                    Icon(Icons.check_circle_rounded, size: 48, color: colorScheme.onPrimaryContainer),
                    const SizedBox(height: 8),
                    Text('¡QR válido!', style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: colorScheme.onPrimaryContainer)),
                    const SizedBox(height: 8),
                    Text('Estudiante: ${_result!['studentName'] ?? '-'}', style: textTheme.bodyMedium),
                    Text('Plan: ${_result!['planName'] ?? '-'}', style: textTheme.bodyMedium),
                    Text('Fecha: ${_result!['date'] ?? '-'}', style: textTheme.bodyMedium),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
