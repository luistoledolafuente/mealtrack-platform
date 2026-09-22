import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../application/qr_scan_provider.dart';
import 'consumption_result_screen.dart';

class StudentQrScanScreen extends StatefulWidget {
  const StudentQrScanScreen({super.key});

  @override
  State<StudentQrScanScreen> createState() => _StudentQrScanScreenState();
}

class _StudentQrScanScreenState extends State<StudentQrScanScreen> {
  final _codeController = TextEditingController();
  int _selectedTab = 0;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _submitManual() async {
    final code = _codeController.text.trim();
    if (code.isEmpty || code.length < 6) return;

    final provider = context.read<QrScanProvider>();
    final result = await provider.submitScan(manualCode: code);

    if (mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ConsumptionResultScreen(result: result),
        ),
      );
    }
  }

  Future<void> _simulateQrScan() async {
    final provider = context.read<QrScanProvider>();
    final result = await provider.submitScan(qrToken: 'simulated_qr_session_hash');

    if (mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ConsumptionResultScreen(result: result),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final provider = context.watch<QrScanProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Consumo'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SegmentedButton<int>(
                segments: const [
                  ButtonSegment(
                    value: 0,
                    label: Text('Escanear QR'),
                    icon: Icon(Icons.qr_code_scanner_rounded),
                  ),
                  ButtonSegment(
                    value: 1,
                    label: Text('Código de 6 dígitos'),
                    icon: Icon(Icons.pin_rounded),
                  ),
                ],
                selected: {_selectedTab},
                onSelectionChanged: (set) {
                  setState(() => _selectedTab = set.first);
                },
              ),
              const SizedBox(height: 20),
              if (_selectedTab == 0) ...[
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          if (!provider.isCameraPermissionGranted)
                            Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.camera_alt_outlined, size: 64, color: Colors.white70),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Permiso de cámara denegado',
                                    style: textTheme.titleMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'Para escanear el QR del restaurante, concede acceso a la cámara o ingresa el código manual de 6 dígitos.',
                                    style: TextStyle(color: Colors.white70),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 16),
                                  ElevatedButton.icon(
                                    onPressed: () => provider.setCameraPermission(true),
                                    icon: const Icon(Icons.lock_open_rounded),
                                    label: const Text('Conceder Permiso'),
                                  ),
                                ],
                              ),
                            )
                          else if (provider.cameraError != null)
                            Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.error_outline_rounded, size: 64, color: Colors.amber),
                                  const SizedBox(height: 16),
                                  Text(
                                    provider.cameraError!,
                                    style: const TextStyle(color: Colors.white),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            )
                          else ...[
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 220,
                                  height: 220,
                                  decoration: BoxDecoration(
                                    border: Border.all(color: colorScheme.primary, width: 3),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: const Center(
                                    child: Icon(Icons.qr_code_2_rounded, size: 140, color: Colors.white54),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Apunta la cámara al QR mostrado por el restaurante',
                                  style: TextStyle(color: Colors.white, fontSize: 13),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 50,
                  child: FilledButton.icon(
                    key: const Key('scan_qr_action_btn'),
                    onPressed: provider.isScanning || !provider.isCameraPermissionGranted
                        ? null
                        : _simulateQrScan,
                    icon: provider.isScanning
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.camera_rounded),
                    label: Text(provider.isScanning ? 'Validando QR...' : 'Registrar consumo'),
                  ),
                ),
              ] else ...[
                Expanded(
                  child: SingleChildScrollView(
                    child: Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        side: BorderSide(color: colorScheme.outlineVariant),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            Icon(Icons.pin_rounded, size: 64, color: colorScheme.primary),
                            const SizedBox(height: 12),
                            Text(
                              'Código Temporal de 6 dígitos',
                              style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Ingresa el código mostrado en la pantalla del restaurante si la cámara no está disponible.',
                              style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            TextField(
                              key: const Key('manual_code_input'),
                              controller: _codeController,
                              keyboardType: TextInputType.number,
                              maxLength: 6,
                              textAlign: TextAlign.center,
                              style: textTheme.headlineMedium?.copyWith(
                                letterSpacing: 8,
                                fontWeight: FontWeight.bold,
                              ),
                              decoration: const InputDecoration(
                                hintText: '000000',
                                counterText: '',
                                border: OutlineInputBorder(),
                              ),
                              onChanged: (val) => provider.setManualCode(val),
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              height: 50,
                              child: FilledButton.icon(
                                key: const Key('submit_manual_code_btn'),
                                onPressed: provider.isScanning || _codeController.text.length < 6
                                    ? null
                                    : _submitManual,
                                icon: provider.isScanning
                                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Icon(Icons.check_rounded),
                                label: Text(provider.isScanning ? 'Verificando...' : 'Registrar consumo'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
