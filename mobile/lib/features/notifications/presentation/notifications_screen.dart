import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/models.dart';
import '../../../core/repositories/repositories.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<NotificationModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<NotificationRepository>().getNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all_rounded),
            onPressed: () async {
              await context.read<NotificationRepository>().markAllAsRead();
              setState(() => _future = context.read<NotificationRepository>().getNotifications());
            },
          ),
        ],
      ),
      body: FutureBuilder<List<NotificationModel>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final notifs = snap.data ?? [];
          if (notifs.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.notifications_none_rounded, size: 64, color: colorScheme.outline),
                  const SizedBox(height: 12),
                  Text('Sin notificaciones', style: textTheme.bodyLarge),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: notifs.map((n) => _NotificationTile(
              notification: n,
              colorScheme: colorScheme,
              textTheme: textTheme,
              onTap: () async {
                if (!n.isRead) {
                  await context.read<NotificationRepository>().markAsRead(n.id);
                  setState(() => _future = context.read<NotificationRepository>().getNotifications());
                }
              },
            )).toList(),
          );
        },
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final NotificationModel notification;
  final ColorScheme colorScheme;
  final TextTheme textTheme;
  final VoidCallback? onTap;

  const _NotificationTile({required this.notification, required this.colorScheme, required this.textTheme, this.onTap});

  @override
  Widget build(BuildContext context) {
    final iconColor = _iconColor(notification.type);
    return Card(
      elevation: 0,
      color: notification.isRead ? null : colorScheme.primaryContainer.withValues(alpha: 0.3),
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: iconColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
          child: Icon(_icon(notification.type), color: iconColor, size: 22),
        ),
        title: Text(notification.title, style: textTheme.bodyMedium?.copyWith(fontWeight: notification.isRead ? FontWeight.normal : FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(notification.message, style: textTheme.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(_timeAgo(notification.createdAt), style: textTheme.labelSmall?.copyWith(color: colorScheme.onSurfaceVariant)),
          ],
        ),
        trailing: notification.isRead ? null
            : Container(width: 8, height: 8, decoration: BoxDecoration(color: colorScheme.primary, shape: BoxShape.circle)),
      ),
    );
  }

  IconData _icon(String type) {
    switch (type) {
      case 'expiration': return Icons.info_rounded;
      case 'payment': return Icons.check_circle_rounded;
      case 'adjustment': return Icons.edit_note_rounded;
      default: return Icons.info_outline_rounded;
    }
  }

  Color _iconColor(String type) {
    switch (type) {
      case 'expiration': return Colors.blue;
      case 'payment': return Colors.green;
      case 'adjustment': return Colors.orange;
      default: return Colors.grey;
    }
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Hace ${diff.inHours} h';
    if (diff.inDays < 7) return 'Hace ${diff.inDays} días';
    return '${d.day}/${d.month}/${d.year}';
  }
}
