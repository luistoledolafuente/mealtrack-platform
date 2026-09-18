import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';
import '../../../shared/providers/auth_provider.dart';

class MealCalendarScreen extends StatefulWidget {
  const MealCalendarScreen({super.key});

  @override
  State<MealCalendarScreen> createState() => _MealCalendarScreenState();
}

class _MealCalendarScreenState extends State<MealCalendarScreen> {
  late DateTime _currentMonth;
  List<DailyMealModel> _meals = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _currentMonth = DateTime(DateTime.now().year, DateTime.now().month);
    _loadMeals();
  }

  Future<void> _loadMeals() async {
    setState(() { _loading = true; _error = null; });
    try {
      final repo = context.read<DailyMealRepository>();
      final data = await repo.getMeals(
        month: _currentMonth.month.toString(),
        year: _currentMonth.year.toString(),
      );
      if (mounted) setState(() { _meals = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Error al cargar consumos'; _loading = false; });
    }
  }

  void _previousMonth() {
    setState(() => _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1));
    _loadMeals();
  }

  void _nextMonth() {
    setState(() => _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1));
    _loadMeals();
  }

  DailyMealModel? _getMealForDay(int day) {
    for (final m in _meals) {
      if (m.date.year == _currentMonth.year &&
          m.date.month == _currentMonth.month &&
          m.date.day == day) {
        return m;
      }
    }
    return null;
  }

  void _showAdjustmentDialog(BuildContext context, DailyMealModel meal) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Solicitar Ajuste'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Fecha: ${meal.date.day}/${meal.date.month}/${meal.date.year}'),
            Text('Estado actual: ${_statusLabel(meal.status)}'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Motivo del ajuste',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              final reason = controller.text.trim();
              if (reason.isEmpty) return;
              
              final messenger = ScaffoldMessenger.of(context);
              final repository = context.read<AdjustmentRepository>();
              
              Navigator.pop(context);
              
              setState(() => _loading = true);
              try {
                await repository.createAdjustment(
                  dailyMealId: meal.id,
                  reason: reason,
                );
                if (mounted) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Solicitud de ajuste creada correctamente')),
                  );
                  _loadMeals();
                }
              } catch (e) {
                if (mounted) {
                  setState(() => _loading = false);
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Error al crear solicitud de ajuste')),
                  );
                }
              }
            },
            child: const Text('Enviar'),
          ),
        ],
      ),
    );
  }

  void _showRegisterTodayDialog() async {
    setState(() => _loading = true);
    String? subId;
    final messenger = ScaffoldMessenger.of(context);
    try {
      final subRepo = context.read<SubscriptionRepository>();
      final subs = await subRepo.getMySubscriptions();
      SubscriptionModel? activeSub;
      for (final s in subs) {
        if (s.isActive) {
          activeSub = s;
          break;
        }
      }
      if (activeSub == null) throw Exception();
      subId = activeSub.id;
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
        messenger.showSnackBar(
          const SnackBar(content: Text('No tienes una suscripción activa para registrar consumos')),
        );
      }
      return;
    }

    if (!mounted) return;
    setState(() => _loading = false);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Registrar consumo'),
        content: const Text('¿Deseas marcar el almuerzo de hoy como consumido?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              final dailyMealRepo = context.read<DailyMealRepository>();
              Navigator.pop(context);
              setState(() => _loading = true);
              try {
                final dateStr = DateTime.now().toIso8601String().split('T').first;
                await dailyMealRepo.registerMeal(
                  subscriptionId: subId!,
                  date: dateStr,
                  status: 'consumed',
                  validationMethod: 'manual',
                );
                if (mounted) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Consumo registrado correctamente')),
                  );
                  _loadMeals();
                }
              } catch (e) {
                if (mounted) {
                  setState(() => _loading = false);
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Error al registrar consumo')),
                  );
                }
              }
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'consumed': return 'Consumido';
      case 'not_consumed': return 'No consumido';
      case 'absent': return 'No consumido';
      case 'justified': return 'Justificado';
      case 'adjusted': return 'Ajustado';
      default: return s;
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final now = DateTime.now();
    final isStudent = context.watch<AuthProvider>().isStudent;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendario de consumos'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(onPressed: _previousMonth, icon: const Icon(Icons.chevron_left)),
                Text(
                  '${_monthName(_currentMonth.month)} ${_currentMonth.year}',
                  style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                IconButton(onPressed: _nextMonth, icon: const Icon(Icons.chevron_right)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                  .map((d) => SizedBox(
                        width: 40,
                        child: Text(d, textAlign: TextAlign.center,
                            style: textTheme.labelSmall?.copyWith(color: colorScheme.onSurfaceVariant)),
                      ))
                  .toList(),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_error!, style: textTheme.bodyLarge),
                            const SizedBox(height: 12),
                            FilledButton.tonal(onPressed: _loadMeals, child: const Text('Reintentar')),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 7,
                          childAspectRatio: 1,
                          mainAxisSpacing: 4,
                          crossAxisSpacing: 4,
                        ),
                        itemCount: _daysInMonth(_currentMonth),
                        itemBuilder: (_, i) {
                          final day = i + 1;
                          final date = DateTime(_currentMonth.year, _currentMonth.month, day);
                          final isToday = date.day == now.day && date.month == now.month && date.year == now.year;
                          final isPast = date.isBefore(DateTime(now.year, now.month, now.day));

                          final meal = _getMealForDay(day);
                          final status = meal?.status;

                          VoidCallback? cellOnTap;
                          if (isStudent) {
                            if (meal != null) {
                              cellOnTap = () => _showAdjustmentDialog(context, meal);
                            } else if (isToday) {
                              cellOnTap = () => _showRegisterTodayDialog();
                            }
                          }

                          return _DayCell(
                            day: day,
                            isToday: isToday,
                            isPast: isPast,
                            status: status,
                            onTap: cellOnTap,
                          );
                        },
                      ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerLow,
              border: Border(top: BorderSide(color: colorScheme.outlineVariant)),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _LegendItem(color: Colors.green, label: 'Consumido'),
                _LegendItem(color: Colors.red, label: 'No consumido'),
                _LegendItem(color: Colors.orange, label: 'Justificado'),
                _LegendItem(color: Colors.blue, label: 'Ajustado'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _monthName(int m) => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][m - 1];

  int _daysInMonth(DateTime d) => DateTime(d.year, d.month + 1, 0).day;
}

class _DayCell extends StatelessWidget {
  final int day;
  final bool isToday;
  final bool isPast;
  final String? status;
  final VoidCallback? onTap;

  const _DayCell({required this.day, required this.isToday, required this.isPast, this.status, this.onTap});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    Color? bgColor;
    if (status == 'consumed') bgColor = Colors.green.withValues(alpha: 0.2);
    if (status == 'not_consumed' || status == 'absent') bgColor = Colors.red.withValues(alpha: 0.2);
    if (status == 'justified') bgColor = Colors.orange.withValues(alpha: 0.2);
    if (status == 'adjusted') bgColor = Colors.blue.withValues(alpha: 0.2);

    final child = Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: isToday ? Border.all(color: colorScheme.primary, width: 2) : null,
      ),
      child: Center(
        child: Text(
          '$day',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: isToday ? FontWeight.bold : null,
                color: isToday ? colorScheme.primary : null,
              ),
        ),
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: child,
      );
    }

    return child;
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
