import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../logic/blocs/auth_bloc.dart' as app_auth;
import '../../logic/blocs/wellness_bloc.dart';
import '../widgets/mood_check_in.dart';
import '../widgets/ai_insights.dart';
import '../widgets/connectivity_banner.dart';
import '../../data/repositories/report_service.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final ReportService _reportService = ReportService();

  @override
  void initState() {
    super.initState();
    context.read<WellnessBloc>().add(WellnessMetricsRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('AeroMind'),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: () => context.push('/chat'),
            icon: const Icon(LucideIcons.messageSquare)
          ),
          IconButton(
            onPressed: () => context.read<WellnessBloc>().add(WellnessSyncRequested()),
            icon: const Icon(LucideIcons.refreshCcw)
          ),
        ],
      ),
      drawer: Drawer(
        child: BlocBuilder<app_auth.AuthBloc, app_auth.AuthState>(
          builder: (context, state) {
            String name = 'Pilot';
            bool isAdmin = false;
            if (state is app_auth.AuthAuthenticated) {
              name = state.user.name;
              isAdmin = state.user.role == 'admin';
            }

            return Column(
              children: [
                UserAccountsDrawerHeader(
                  decoration: const BoxDecoration(color: Color(0xFF2563EB)),
                  accountName: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  accountEmail: Text(isAdmin ? 'Wellness Administrator' : 'Verified Professional'),
                  currentAccountPicture: const CircleAvatar(backgroundColor: Colors.white, child: Icon(LucideIcons.user, color: Color(0xFF2563EB))),
                ),
                ListTile(leading: const Icon(LucideIcons.home), title: const Text('Dashboard'), onTap: () => Navigator.pop(context)),
                if (isAdmin)
                  ListTile(
                    leading: const Icon(LucideIcons.shield, color: Colors.orange),
                    title: const Text('Admin: Reports'),
                    onTap: () { Navigator.pop(context); context.push('/admin/messages'); },
                  ),
                ListTile(leading: const Icon(LucideIcons.messageSquare), title: const Text('Anonymous Support'), onTap: () { Navigator.pop(context); context.push('/chat'); }),
                ListTile(leading: const Icon(LucideIcons.bookOpen), title: const Text('Resources'), onTap: () { Navigator.pop(context); context.push('/resources'); }),
                ListTile(leading: const Icon(LucideIcons.wind), title: const Text('Breathing'), onTap: () { Navigator.pop(context); context.push('/breathing'); }),
                ListTile(leading: const Icon(LucideIcons.settings), title: const Text('Settings'), onTap: () { Navigator.pop(context); context.push('/settings'); }),
                const Spacer(),
                const Divider(),
                ListTile(
                  leading: const Icon(LucideIcons.logOut, color: Colors.red),
                  title: const Text('Logout'),
                  onTap: () => context.read<app_auth.AuthBloc>().add(app_auth.AuthLogoutRequested())
                ),
                const SizedBox(height: 20),
              ],
            );
          },
        ),
      ),
      body: Column(
        children: [
          const ConnectivityBanner(),
          Expanded(
            child: BlocBuilder<WellnessBloc, WellnessState>(
              builder: (context, state) {
                if (state is WellnessLoading) return const Center(child: CircularProgressIndicator());
                if (state is WellnessError) return Center(child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(LucideIcons.alertCircle, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(state.message, textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: () => context.read<WellnessBloc>().add(WellnessMetricsRequested()), child: const Text('Retry'))
                    ],
                  ),
                ));
                if (state is WellnessLoaded) {
                  final data = state.data;
                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildWellnessScore(context, data['score']),
                        const SizedBox(height: 16),
                        _buildActionRow(data),
                        const SizedBox(height: 16),
                        MoodCheckIn(onMoodSubmit: (mood) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Mood recorded: $mood')));
                        }),
                        const SizedBox(height: 16),
                        _buildWearableGrid(data),
                        const SizedBox(height: 16),
                        if (data['insights'] != null) AIInsightsWidget(insights: data['insights']),
                        const SizedBox(height: 16),
                        if (data['history'] != null && (data['history'] as List).isNotEmpty) _buildHistoryChart(data['history']),
                      ],
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionRow(Map<String, dynamic> data) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _reportService.generateAndPrintReport(data),
            icon: const Icon(LucideIcons.fileText, size: 16),
            label: const Text('Weekly Report'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black87),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => context.push('/breathing'),
            icon: const Icon(LucideIcons.wind, size: 16),
            label: const Text('Guided Recovery'),
          ),
        ),
      ],
    );
  }

  Widget _buildWellnessScore(BuildContext context, int score) {
    final color = score > 70 ? Colors.green : (score > 40 ? Colors.orange : Colors.red);
    final status = score > 70 ? 'Healthy' : (score > 40 ? 'Stressed' : 'Critical');

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(LucideIcons.activity, color: Color(0xFF2563EB)), const SizedBox(width: 8), Text('Wellness Score', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold))]),
            const SizedBox(height: 24),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(height: 150, width: 150, child: CircularProgressIndicator(value: score / 100, strokeWidth: 12, backgroundColor: Colors.grey[200], color: color)),
                Column(children: [Text('$score', style: GoogleFonts.inter(fontSize: 48, fontWeight: FontWeight.bold, color: color)), Text(status, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.grey[600]))]),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWearableGrid(Map<String, dynamic> data) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.4,
      children: [
        _buildMetricCard(LucideIcons.heart, 'Heart Rate', '${data['heartRate']}', 'bpm', Colors.red),
        _buildMetricCard(LucideIcons.moon, 'Sleep', '${data['sleepHours'].toStringAsFixed(1)}', 'hours', Colors.blue),
        _buildMetricCard(LucideIcons.footprints, 'Steps', '${data['steps']}', 'steps', Colors.green),
        _buildMetricCard(LucideIcons.wind, 'Stress', 'Active', '', Colors.purple),
      ],
    );
  }

  Widget _buildMetricCard(IconData icon, String label, String value, String unit, Color color) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)), Icon(icon, size: 16, color: color)]),
            const Spacer(),
            Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)), const SizedBox(width: 4), Text(unit, style: const TextStyle(fontSize: 10, color: Colors.grey))]),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryChart(List<dynamic> history) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('7-Day Wellness Trend', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (val, meta) {
                      if (val.toInt() >= history.length) return const SizedBox.shrink();
                      final dateStr = history[val.toInt()]['date'].toString();
                      final display = dateStr.length > 10 ? dateStr.substring(5, 10) : dateStr;
                      return Text(display, style: const TextStyle(fontSize: 10, color: Colors.grey));
                    })),
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: history.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value['score'].toDouble())).toList(),
                      isCurved: true,
                      color: const Color(0xFF2563EB),
                      barWidth: 3,
                      dotData: const FlDotData(show: true),
                      belowBarData: BarAreaData(show: true, color: const Color(0xFF2563EB).withOpacity(0.1)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
