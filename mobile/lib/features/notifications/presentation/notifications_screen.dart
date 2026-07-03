import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        actions: [
          IconButton(icon: const Icon(Icons.done_all_rounded), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _NotificationTile(
            colorScheme: colorScheme,
            textTheme: textTheme,
            icon: Icons.info_rounded,
            iconColor: Colors.blue,
            title: 'Quedan 5 días de tu plan',
            message: 'Tu Plan Mensual 30 Días vence pronto. Renueva para no perder días.',
            time: 'Hace 2 horas',
            isUnread: true,
          ),
          _NotificationTile(
            colorScheme: colorScheme,
            textTheme: textTheme,
            icon: Icons.check_circle_rounded,
            iconColor: Colors.green,
            title: 'Pago confirmado',
            message: 'Tu pago de S/ 270.00 ha sido registrado exitosamente.',
            time: 'Ayer',
            isUnread: true,
          ),
          _NotificationTile(
            colorScheme: colorScheme,
            textTheme: textTheme,
            icon: Icons.edit_note_rounded,
            iconColor: Colors.orange,
            title: 'Solicitud de ajuste aprobada',
            message: 'Tu solicitud para el 28 Jun 2026 ha sido aprobada.',
            time: 'Hace 3 días',
            isUnread: false,
          ),
          _NotificationTile(
            colorScheme: colorScheme,
            textTheme: textTheme,
            icon: Icons.info_outline_rounded,
            iconColor: Colors.grey,
            title: 'Bienvenido a MealTrack',
            message: 'Tu cuenta ha sido creada exitosamente.',
            time: 'Hace 1 semana',
            isUnread: false,
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final ColorScheme colorScheme;
  final TextTheme textTheme;
  final IconData icon;
  final Color iconColor;
  final String title;
  final String message;
  final String time;
  final bool isUnread;

  const _NotificationTile({required this.colorScheme, required this.textTheme, required this.icon, required this.iconColor, required this.title, required this.message, required this.time, required this.isUnread});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: isUnread ? colorScheme.primaryContainer.withValues(alpha: 0.3) : null,
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: iconColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: iconColor, size: 22),
        ),
        title: Text(title, style: textTheme.bodyMedium?.copyWith(fontWeight: isUnread ? FontWeight.w600 : FontWeight.normal)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(message, style: textTheme.bodySmall),
            const SizedBox(height: 2),
            Text(time, style: textTheme.labelSmall?.copyWith(color: colorScheme.onSurfaceVariant)),
          ],
        ),
        trailing: isUnread
            ? Container(width: 8, height: 8, decoration: BoxDecoration(color: colorScheme.primary, shape: BoxShape.circle))
            : null,
      ),
    );
  }
}
