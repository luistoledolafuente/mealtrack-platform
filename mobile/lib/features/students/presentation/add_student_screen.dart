import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/repositories/repositories.dart';

class AddStudentScreen extends StatefulWidget {
  const AddStudentScreen({super.key});

  @override
  State<AddStudentScreen> createState() => _AddStudentScreenState();
}

class _AddStudentScreenState extends State<AddStudentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  Map<String, dynamic>? _created;
  String? _error;
  List<MealPlanModel> _plans = [];
  bool _plansLoading = true;
  String? _selectedPlanId;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    try {
      final plans = await context.read<MealPlanRepository>().getMealPlans();
      if (mounted) setState(() { _plans = plans; _plansLoading = false; });
    } catch (_) {
      if (mounted) setState(() { _plans = []; _plansLoading = false; });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() { _loading = true; _error = null; _created = null; });

    try {
      final repo = context.read<UserRepository>();
      final created = await repo.createUser(
        fullName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        password: _passwordController.text.trim().isEmpty
            ? null
            : _passwordController.text.trim(),
        planId: _selectedPlanId,
      );
      if (mounted) {
        setState(() { _created = created; _loading = false; });
        _nameController.clear();
        _emailController.clear();
        _phoneController.clear();
        _passwordController.clear();
        _selectedPlanId = null;
      }
    } on ApiException catch (e) {
      if (mounted) setState(() { _error = e.message; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agregar estudiante'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(Icons.person_add_alt_1_rounded, size: 64, color: colorScheme.primary),
              const SizedBox(height: 8),
              Text(
                'Da de alta a un nuevo estudiante. Si eliges plan, su suscripción se crea automáticamente.',
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _nameController,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  labelText: 'Nombre completo',
                  prefixIcon: Icon(Icons.badge_outlined),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Ingresa el nombre' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Correo electrónico',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                validator: (v) {
                  final value = v?.trim() ?? '';
                  if (value.isEmpty) return 'Ingresa el correo';
                  if (!value.contains('@') || !value.contains('.')) return 'Correo inválido';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Teléfono',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                validator: (v) {
                  final value = v?.trim() ?? '';
                  if (value.isEmpty) return null;
                  if (!RegExp(r'^[0-9+\-\s]{7,20}$').hasMatch(value)) {
                    return 'Teléfono inválido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Contraseña inicial (opcional)',
                  hintText: 'Se generará una temporal si la dejas vacía (mínimo 8 caracteres)',
                  prefixIcon: Icon(Icons.lock_outlined),
                ),
                validator: (v) {
                  final value = v ?? '';
                  if (value.isEmpty) return null;
                  if (value.length < 8) return 'Mínimo 8 caracteres';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              _plansLoading
                  ? const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  : DropdownButtonFormField<String>(
                      initialValue: _selectedPlanId,
                      decoration: const InputDecoration(
                        labelText: 'Plan de comida (opcional)',
                        prefixIcon: Icon(Icons.restaurant_menu_outlined),
                      ),
                      items: _plans
                          .map((p) => DropdownMenuItem(
                                value: p.id,
                                child: Text('${p.name} — ${p.durationDays} días',
                                    overflow: TextOverflow.ellipsis),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedPlanId = v),
                    ),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.errorContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(_error!, style: textTheme.bodySmall?.copyWith(color: colorScheme.onErrorContainer)),
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Crear cuenta', style: TextStyle(fontSize: 16)),
              ),
              if (_created != null) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.check_circle_rounded, color: colorScheme.onPrimaryContainer),
                          const SizedBox(width: 8),
                          Text('Estudiante creado', style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onPrimaryContainer,
                          )),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text('Cuenta: ${_created!['email']}', style: textTheme.bodyMedium),
                      if (_created!['phone'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text('Teléfono: ${_created!['phone']}', style: textTheme.bodyMedium),
                        ),
                      if (_created!['temporaryPassword'] != null)
                        Container(
                          margin: const EdgeInsets.only(top: 8),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: colorScheme.surface,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: SelectableText(
                            'Contraseña temporal: ${_created!['temporaryPassword']}',
                            style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        )
                      else
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text('Contraseña: la definida al crear', style: textTheme.bodyMedium),
                        ),
                      if (_created!['subscription'] != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.check_circle_outline_rounded, size: 18, color: colorScheme.onPrimaryContainer),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Plan asignado: ${_created!['subscription']['mealPlanName'] ?? _created!['subscription']['mealPlanId']}',
                                style: textTheme.bodyMedium,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
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