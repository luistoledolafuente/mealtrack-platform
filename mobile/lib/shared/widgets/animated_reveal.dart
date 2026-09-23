import 'package:flutter/material.dart';

class AnimatedReveal extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const AnimatedReveal(
      {super.key, required this.child, this.delay = Duration.zero});

  @override
  State<AnimatedReveal> createState() => _AnimatedRevealState();
}

class _AnimatedRevealState extends State<AnimatedReveal> {
  bool _visible = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _visible = true;
      return;
    }
    Future<void>.delayed(widget.delay, () {
      if (mounted) setState(() => _visible = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 240),
      curve: Curves.easeOutCubic,
      opacity: _visible ? 1 : 0,
      child: AnimatedSlide(
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOutCubic,
        offset: _visible ? Offset.zero : const Offset(0, 0.035),
        child: widget.child,
      ),
    );
  }
}
