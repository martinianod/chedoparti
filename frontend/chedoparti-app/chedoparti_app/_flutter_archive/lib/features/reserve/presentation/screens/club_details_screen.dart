import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/colors.dart';
import '../../../home/data/models/club_model.dart';
import '../../../home/data/home_repository.dart';
import '../../../home/data/models/court_model.dart';
import '../widgets/day_selector.dart';
import '../widgets/booking_slot.dart';

// Provider to fetch club details by ID (mocked by passing object or fetch)
// For now we will fetch courts for the club
final clubCourtsProvider = FutureProvider.family<List<CourtModel>, String>((ref, clubId) async {
  return ref.read(homeRepositoryProvider).getCourtsByClubId(clubId);
});

class ClubDetailsScreen extends ConsumerStatefulWidget {
  final ClubModel club; // Passing full object for simplicity in this prompt

  const ClubDetailsScreen({super.key, required this.club});

  @override
  ConsumerState<ClubDetailsScreen> createState() => _ClubDetailsScreenState();
}

class _ClubDetailsScreenState extends ConsumerState<ClubDetailsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 250.h,
              pinned: true,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => context.pop(),
              ),
              flexibleSpace: FlexibleSpaceBar(
                title: Text(widget.club.name, 
                  style: const TextStyle(
                    color: Colors.white, 
                    shadows: [Shadow(color: Colors.black45, blurRadius: 4)]
                  )
                ),
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    CachedNetworkImage(
                      imageUrl: widget.club.imageUrl,
                      fit: BoxFit.cover,
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Colors.black54],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverPersistentHeader(
              delegate: _SliverAppBarDelegate(
                TabBar(
                  controller: _tabController,
                  labelColor: AppColors.primary,
                  unselectedLabelColor: AppColors.textSecondaryLight,
                  indicatorColor: AppColors.primary,
                  tabs: const [
                    Tab(text: "Reserva"),
                    Tab(text: "Información"),
                  ],
                ),
              ),
              pinned: true,
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            // Reserva Tab
            _buildBookingTab(),
            // Info Tab
            _buildInfoTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingTab() {
    final courtsAsync = ref.watch(clubCourtsProvider(widget.club.id));

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 16.h),
            child: DaySelector(
              selectedDate: _selectedDate,
              onDateSelected: (date) {
                setState(() {
                  _selectedDate = date;
                });
              },
            ),
          ),
        ),
        courtsAsync.when(
          data: (courts) {
            return SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final court = courts[index];
                  return Container(
                    margin: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    padding: EdgeInsets.all(16.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(court.name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp)),
                            Text('\$${court.pricePerHour.toStringAsFixed(0)}', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ],
                        ),
                         Text('${court.sport} • ${court.surface.name} • ${court.type.name}', 
                           style: TextStyle(fontSize: 12.sp, color: AppColors.textSecondaryLight)
                         ),
                        SizedBox(height: 16.h),
                        Wrap(
                          spacing: 8.w,
                          runSpacing: 8.h,
                          children: (court.availableSlots ?? []).map((slot) {
                            return BookingSlot(
                              time: slot,
                              isAvailable: true,
                              onTap: () {
                                _showBookingConfirmation(court, slot);
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  );
                },
                childCount: courts.length,
              ),
            );
          },
          loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
          error: (err, stack) => SliverToBoxAdapter(child: Center(child: Text('Error: $err'))),
        ),
      ],
    );
  }

  Widget _buildInfoTab() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Sobre el club", style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold)),
          SizedBox(height: 8.h),
          Text(
            "El mejor club de la zona con canchas de primer nivel. Estacionamiento gratuito, vestuarios y bar.",
            style: TextStyle(color: AppColors.textSecondaryLight, fontSize: 14.sp),
          ),
          SizedBox(height: 24.h),
          Text("Ubicación", style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold)),
           SizedBox(height: 8.h),
          Text(widget.club.address, style: TextStyle(color: AppColors.textSecondaryLight, fontSize: 14.sp)),
          // Map placeholder
          Container(
            margin: EdgeInsets.only(top: 12.h),
            height: 150.h,
            width: double.infinity,
            color: Colors.grey.shade200,
            alignment: Alignment.center,
            child: const Icon(Icons.map, size: 40, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  void _showBookingConfirmation(CourtModel court, String time) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Reserva'),
        content: Text('¿Reservar ${court.name} para el ${DateFormat('dd/MM').format(_selectedDate)} a las $time?\nPrecio: \$${court.pricePerHour.toStringAsFixed(0)}'),
        actions: [
          TextButton(onPressed: () => context.pop(), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              context.pop(); // Close dialog
              // Show success animation/overlay
               ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('¡Reserva confirmada con éxito!'), backgroundColor: AppColors.success),
              );
              context.pop(); // Go back to Home
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;
  _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height + 1; // +1 for border
  @override
  double get maxExtent => _tabBar.preferredSize.height + 1;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Expanded(child: _tabBar),
          const Divider(height: 1),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}
