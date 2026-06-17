import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:aero_mind_wellness/data/repositories/api_service.dart';
import 'package:intl/intl.dart';

class AdminMessagesPage extends StatefulWidget {
  const AdminMessagesPage({super.key});

  @override
  State<AdminMessagesPage> createState() => _AdminMessagesPageState();
}

class _AdminMessagesPageState extends State<AdminMessagesPage> {
  final _apiService = ApiService();
  List<dynamic> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMessages();
  }

  Future<void> _fetchMessages() async {
    setState(() => _isLoading = true);
    try {
      final messages = await _apiService.getAdminMessages();
      setState(() => _messages = messages);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to fetch messages. Check admin permissions.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin: Anonymous Reports'),
        backgroundColor: Colors.black87,
        foregroundColor: Colors.white,
        actions: [
          IconButton(onPressed: _fetchMessages, icon: const Icon(LucideIcons.refreshCcw)),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _messages.isEmpty
              ? _buildEmptyState()
              : _buildMessagesList(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.inbox, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text('No anonymous reports yet.', style: GoogleFonts.inter(color: Colors.grey[500])),
        ],
      ),
    );
  }

  Widget _buildMessagesList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final msg = _messages[index];
        final date = DateTime.parse(msg['timestamp']);
        final formattedDate = DateFormat('MMM d, HH:mm').format(date);

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            title: Text(msg['content']),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Chip(
                    label: Text(msg['category'].toUpperCase(), style: const TextStyle(fontSize: 10)),
                    visualDensity: VisualDensity.compact,
                  ),
                  Text(formattedDate, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
