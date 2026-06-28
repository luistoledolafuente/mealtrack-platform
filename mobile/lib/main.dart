import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';
import 'core/storage/sync_queue.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MealTrackApp());
}

class MealTrackApp extends StatelessWidget {
  const MealTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SyncQueue()),
      ],
      child: MaterialApp.router(
        title: 'MealTrack',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
