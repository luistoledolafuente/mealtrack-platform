import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/widgets/animated_reveal.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _errorMessage = null);
    try {
      final auth = context.read<AuthProvider>();
      await auth.login(_emailController.text.trim(), _passwordController.text);
      if (!mounted) {
        return;
      }
      context.go(auth.isStudent
          ? RouteNames.studentDashboardPath
          : RouteNames.adminDashboardPath);
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _errorMessage = error.message);
      }
    } catch (_) {
      if (mounted) {
        setState(() =>
            _errorMessage = 'No pudimos iniciar sesión. Inténtalo nuevamente.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [scheme.primary, scheme.secondary, const Color(0xFF7C2D12)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 32, 20, 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: AutofillGroup(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AnimatedReveal(child: _BrandHeader(textTheme: text)),
                      const SizedBox(height: 32),
                      AnimatedReveal(
                        delay: const Duration(milliseconds: 80),
                        child: Card(
                          color: scheme.surface,
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Text('Bienvenido',
                                      style: text.headlineMedium),
                                  const SizedBox(height: 8),
                                  Text(
                                      'Ingresa para consultar y gestionar tus consumos.',
                                      style: text.bodyMedium?.copyWith(
                                          color: scheme.onSurfaceVariant)),
                                  const SizedBox(height: 28),
                                  TextFormField(
                                    controller: _emailController,
                                    autofillHints: const [
                                      AutofillHints.username,
                                      AutofillHints.email
                                    ],
                                    keyboardType: TextInputType.emailAddress,
                                    textInputAction: TextInputAction.next,
                                    decoration: const InputDecoration(
                                        labelText: 'Correo electrónico',
                                        hintText: 'nombre@correo.com',
                                        prefixIcon: Icon(
                                            Icons.alternate_email_rounded)),
                                    validator: (value) {
                                      if (value == null ||
                                          value.trim().isEmpty) {
                                        return 'Ingresa tu correo electrónico';
                                      }
                                      if (!value.contains('@')) {
                                        return 'Ingresa un correo válido';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 16),
                                  TextFormField(
                                    controller: _passwordController,
                                    autofillHints: const [
                                      AutofillHints.password
                                    ],
                                    obscureText: _obscurePassword,
                                    textInputAction: TextInputAction.done,
                                    onFieldSubmitted: (_) => _submit(),
                                    decoration: InputDecoration(
                                      labelText: 'Contraseña',
                                      prefixIcon: const Icon(
                                          Icons.lock_outline_rounded),
                                      suffixIcon: IconButton(
                                        tooltip: _obscurePassword
                                            ? 'Mostrar contraseña'
                                            : 'Ocultar contraseña',
                                        icon: Icon(_obscurePassword
                                            ? Icons.visibility_outlined
                                            : Icons.visibility_off_outlined),
                                        onPressed: () => setState(() =>
                                            _obscurePassword =
                                                !_obscurePassword),
                                      ),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Ingresa tu contraseña';
                                      }
                                      if (value.length < 6) {
                                        return 'La contraseña debe tener al menos 6 caracteres';
                                      }
                                      return null;
                                    },
                                  ),
                                  if (_errorMessage != null) ...[
                                    const SizedBox(height: 16),
                                    Semantics(
                                      liveRegion: true,
                                      child: Container(
                                        padding: const EdgeInsets.all(14),
                                        decoration: BoxDecoration(
                                            color: scheme.errorContainer,
                                            borderRadius:
                                                BorderRadius.circular(14)),
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Icon(Icons.info_outline_rounded,
                                                color: scheme.onErrorContainer),
                                            const SizedBox(width: 10),
                                            Expanded(
                                                child: Text(_errorMessage!,
                                                    style: text.bodySmall?.copyWith(
                                                        color: scheme
                                                            .onErrorContainer))),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 24),
                                  Consumer<AuthProvider>(
                                    builder: (context, auth, _) {
                                      final loading = auth.status ==
                                          AuthStatus.authenticating;
                                      return FilledButton(
                                        onPressed: loading ? null : _submit,
                                        child: AnimatedSwitcher(
                                          duration:
                                              const Duration(milliseconds: 180),
                                          child: loading
                                              ? const SizedBox(
                                                  key: ValueKey('loading'),
                                                  width: 22,
                                                  height: 22,
                                                  child:
                                                      CircularProgressIndicator(
                                                          strokeWidth: 2,
                                                          color: Colors.white))
                                              : const Row(
                                                  key: ValueKey('submit'),
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  children: [
                                                      Icon(Icons.login_rounded),
                                                      SizedBox(width: 10),
                                                      Text('Iniciar sesión')
                                                    ]),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      AnimatedReveal(
                        delay: const Duration(milliseconds: 140),
                        child: Text(
                            'Tu información está protegida y disponible cuando la necesites.',
                            textAlign: TextAlign.center,
                            style: text.bodySmall?.copyWith(
                                color: Colors.white.withValues(alpha: 0.84))),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BrandHeader extends StatelessWidget {
  final TextTheme textTheme;

  const _BrandHeader({required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Semantics(
          label: 'MealTrack',
          child: Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: const [
                  BoxShadow(
                      color: Color(0x33000000),
                      blurRadius: 22,
                      offset: Offset(0, 10))
                ]),
            child: Icon(Icons.restaurant_menu_rounded,
                color: Theme.of(context).colorScheme.primary, size: 38),
          ),
        ),
        const SizedBox(height: 16),
        Text('MealTrack',
            style: textTheme.displaySmall?.copyWith(color: Colors.white)),
        const SizedBox(height: 6),
        Text('Tu pensión, siempre bajo control.',
            textAlign: TextAlign.center,
            style: textTheme.bodyLarge
                ?.copyWith(color: Colors.white.withValues(alpha: 0.88))),
      ],
    );
  }
}
