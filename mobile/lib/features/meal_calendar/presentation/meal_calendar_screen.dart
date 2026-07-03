import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MealCalendarScreen extends StatefulWidget {
  const MealCalendarScreen({super.key});

  @override
  State<MealCalendarScreen> createState() => _MealCalendarScreenState();
}

class _MealCalendarScreenState extends State<MealCalendarScreen> {
  late DateTime _currentMonth;

  @override
  void initState() {
    super.initState();
    _currentMonth = DateTime(DateTime.now().year, DateTime.now().month);
  }

  void _previousMonth() => setState(() => _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1));
  void _nextMonth() => setState(() => _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1));

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final now = DateTime.now();

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
            child: GridView.builder(
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
                final isPast = date.isBefore(DateTime.now().subtract(const Duration(days: 1)));

                return _DayCell(
                  day: day,
                  isToday: isToday,
                  isPast: isPast,
                  status: isPast ? (day % 3 == 0 ? 'consumed' : (day % 5 == 0 ? 'absent' : null)) : null,
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
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _LegendItem(color: Colors.green, label: 'Consumido'),
                _LegendItem(color: Colors.red, label: 'No consumido'),
                _LegendItem(color: Colors.orange, label: 'Justificado'),
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

  const _DayCell({required this.day, required this.isToday, required this.isPast, this.status});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    Color? bgColor;
    if (status == 'consumed') bgColor = Colors.green.withValues(alpha: 0.2);
    if (status == 'absent') bgColor = Colors.red.withValues(alpha: 0.2);

    return Container(
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
