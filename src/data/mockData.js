// ─── Room Types ───────────────────────────────────────────────────────────────
export const roomTypes = [
  { value: 'standard',     label: 'Standard Room' },
  { value: 'deluxe',       label: 'Deluxe Room' },
  { value: 'suite',        label: 'Suite' },
  { value: 'penthouse',    label: 'Penthouse' },
  { value: 'presidential', label: 'Presidential' },
]

// ─── Amenities ────────────────────────────────────────────────────────────────
export const amenities = [
  'WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service',
  'Balcony', 'Jacuzzi', 'Gym', 'Pool', 'Spa',
  'Work Desk', 'Safe', 'Coffee Maker', 'Kitchenette', 'Living Area',
  'King Bed', 'Ocean View', 'Parking', 'Breakfast', 'Concierge',
]

// ─── Pakistan Cities ──────────────────────────────────────────────────────────
export const pakistanCities = [
  { id: 1, name: 'Karachi',   province: 'Sindh',                       description: 'Largest city & financial hub of Pakistan.' },
  { id: 2, name: 'Lahore',    province: 'Punjab',                      description: 'Cultural heart of Pakistan known for food & heritage.' },
  { id: 3, name: 'Islamabad', province: 'Islamabad Capital Territory', description: 'The modern, clean capital city of Pakistan.' },
  { id: 4, name: 'Peshawar',  province: 'Khyber Pakhtunkhwa',          description: 'One of the oldest cities in South Asia.' },
  { id: 5, name: 'Quetta',    province: 'Balochistan',                 description: 'Known as the fruit garden of Pakistan.' },
]

// ─── Image banks — each pool has 24 UNIQUE entries, no cross-pool repeats ────
// Hotels: 0-23 (24 hotels) → pool[hi] gives a completely unique cover image
const STD_IMGS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80',
  'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=900&q=80',
  'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=900&q=80',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=900&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=80',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=900&q=80',
  'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=900&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=900&q=80',
  'https://images.unsplash.com/photo-1559599238-308793637427?w=900&q=80',
  'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=900&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
  'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=900&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
  'https://images.unsplash.com/photo-1554295405-abb8fd54f153?w=900&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
  'https://images.unsplash.com/photo-1467987506553-8f3916508521?w=900&q=80',
  'https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=900&q=80',
  'https://images.unsplash.com/photo-1560448075-bb485b1f70a7?w=900&q=80',
  'https://images.unsplash.com/photo-1509600110300-21b9d5fedeb7?w=900&q=80',
]
const DLX_IMGS = [
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=900&q=80',
  'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=900&q=80',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=900&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=80',
  'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=900&q=80',
  'https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=900&q=80',
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=900&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=900&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80',
  'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=900&q=80',
  'https://images.unsplash.com/photo-1609766857751-dff33b867cff?w=900&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&q=80',
  'https://images.unsplash.com/photo-1553653924-39b70295f8da?w=900&q=80',
  'https://images.unsplash.com/photo-1529408686214-b48b8532f72c?w=900&q=80',
  'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=900&q=80',
  'https://images.unsplash.com/photo-1588851273077-5c20c7c18fb2?w=900&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=900&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
  'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=900&q=80',
]
const STE_IMGS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80',
  'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=900&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80',
  'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=900&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=900&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=80',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&q=80',
  'https://images.unsplash.com/photo-1578898886270-06a6a2e3c52f?w=900&q=80',
  'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=900&q=80',
  'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=900&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&q=80',
  'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=900&q=80',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=900&q=80',
  'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=900&q=80',
  'https://images.unsplash.com/photo-1602002418082-a4443978a5d9?w=900&q=80',
  'https://images.unsplash.com/photo-1560200353-ce0a817f02a6?w=900&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=80',
  'https://images.unsplash.com/photo-1529408686214-b48b8532f72c?w=900&q=80',
  'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=900&q=80',
  'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
]
const PNT_IMGS = [
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=80',
  'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=900&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=80',
  'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=900&q=80',
  'https://images.unsplash.com/photo-1551361415-69c87624334f?w=900&q=80',
  'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=900&q=80',
  'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=900&q=80',
  'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=900&q=80',
  'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&q=80',
]

// Extra gallery images for the detail-page slideshow (bathroom, view, lounge)
const BATH = [
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80',
  'https://images.unsplash.com/photo-1620626011761-996317702782?w=900&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6d350f68?w=900&q=80',
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=900&q=80',
]
const VIEW = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
  'https://images.unsplash.com/photo-1475113548492-48d4f0d94eb5?w=900&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
]
const LOUNGE = [
  'https://images.unsplash.com/photo-1538944495092-31a4fad7f22c?w=900&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=900&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80',
]

// ─── Pakistan Hotels ──────────────────────────────────────────────────────────
export const pakistanHotels = [
  // ── Karachi ──
  { _id:'pk_h001',cityId:1,cityName:'Karachi',name:'Movenpick Hotel Karachi',stars:5,rating:4.5,image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9SDH2FFhtXe2PKeZpcdPexmujnlhIeKCRKA&s',address:'Club Road, Karachi',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Balcony','Jacuzzi','Gym','Pool','Spa'],price:{standard:22000,deluxe:38000,suite:72000,currency:'PKR'}},
  { _id:'pk_h002',cityId:1,cityName:'Karachi',name:'Pearl Continental Karachi',stars:5,rating:4.6,image:'https://lh3.googleusercontent.com/p/AF1QipP_lmegf5X1buE6Blrl55xxOCvva3whMWCOzio=w324-h312-n-k-no',address:'Club Road, Karachi',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Jacuzzi','King Bed','Pool','Gym','Concierge'],price:{standard:24000,deluxe:42000,suite:85000,penthouse:160000,currency:'PKR'}},
  { _id:'pk_h003',cityId:1,cityName:'Karachi',name:'Avari Towers Karachi',stars:5,rating:4.4,image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/bd/e6/06/avari-towers-karachi.jpg?w=700&h=-1&s=1',address:'Fatima Jinnah Road, Karachi',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Balcony','Work Desk','Pool'],price:{standard:19000,deluxe:34000,suite:65000,currency:'PKR'}},
  { _id:'pk_h004',cityId:1,cityName:'Karachi',name:'Beach Luxury Hotel Karachi',stars:4,rating:4.3,image:'https://pix10.agoda.net/hotelImages/8092740/-1/417798f146e06cf4f623a9bfa3b85e6d.jpg?ca=9&ce=1&s=702x392',address:'M.T. Khan Road, Karachi',amenities:['WiFi','TV','Air Conditioning','Room Service','Work Desk','Safe','Parking'],price:{standard:16000,deluxe:28000,suite:55000,currency:'PKR'}},
  { _id:'pk_h005',cityId:1,cityName:'Karachi',name:'The Grand Manor Karachi',stars:5,rating:4.7,image:'https://images.unsplash.com/photo-1566073771259-6a8506099945',address:'Clifton, Karachi',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Balcony','Jacuzzi','King Bed','Living Area','Spa','Concierge'],price:{standard:25000,deluxe:45000,suite:90000,penthouse:200000,currency:'PKR'}},
  { _id:'pk_h006',cityId:1,cityName:'Karachi',name:'Karachi Serena Hotel',stars:5,rating:4.6,image:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',address:'Abdullah Haroon Road, Karachi',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Work Desk','Safe','Pool','Breakfast'],price:{standard:21000,deluxe:38000,suite:75000,currency:'PKR'}},
  // ── Lahore ──
  { _id:'pk_h007',cityId:2,cityName:'Lahore',name:'Pearl Continental Lahore',stars:5,rating:4.5,image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/55/63/30/pearl-continental-lahore.jpg?w=900&h=500&s=1',address:'Shahrah-e-Quaid-e-Azam, Lahore',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Pool','Gym','Jacuzzi','King Bed','Concierge'],price:{standard:20000,deluxe:36000,suite:70000,penthouse:140000,currency:'PKR'}},
  { _id:'pk_h008',cityId:2,cityName:'Lahore',name:'Avari Lahore',stars:5,rating:4.4,image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/16/b5/28/avari-hotel-lahore.jpg?w=900&h=500&s=1',address:'87 The Mall, Lahore',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Work Desk','Safe','Pool'],price:{standard:18000,deluxe:32000,suite:62000,currency:'PKR'}},
  { _id:'pk_h009',cityId:2,cityName:'Lahore',name:"Faletti's Hotel Lahore",stars:4,rating:4.2,image:'https://cf.bstatic.com/xdata/images/hotel/max1024x768/262169208.jpg?k=094e22adf24c1dfc0fe5d89ec080ebdbe8a9426308357251aaf3af01973c7382&o=',address:'Egerton Road, Lahore',amenities:['WiFi','TV','Air Conditioning','Room Service','Work Desk','Safe'],price:{standard:15000,deluxe:28000,suite:55000,currency:'PKR'}},
  { _id:'pk_h010',cityId:2,cityName:'Lahore',name:'Nishat Hotel Lahore',stars:5,rating:4.6,image:'https://images.unsplash.com/photo-1564501049412-61c2a3083791',address:'Main Boulevard Gulberg, Lahore',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Balcony','King Bed','Living Area','Gym','Spa'],price:{standard:22000,deluxe:40000,suite:78000,penthouse:155000,currency:'PKR'}},
  { _id:'pk_h011',cityId:2,cityName:'Lahore',name:'Lahore Serena Hotel',stars:5,rating:4.7,image:'https://images.unsplash.com/photo-1590490360182-c33d57733427',address:'Egerton Road, Lahore',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Balcony','Jacuzzi','Spa','Pool','Breakfast','Concierge'],price:{standard:23000,deluxe:40000,suite:80000,penthouse:150000,currency:'PKR'}},
  // ── Islamabad ──
  { _id:'pk_h012',cityId:3,cityName:'Islamabad',name:'Islamabad Serena Hotel',stars:5,rating:4.6,image:'https://cf.bstatic.com/xdata/images/hotel/max1024x768/183065428.jpg?k=23123f8db7249214d0796fdd0b446afa52e6ba89b5e9a5de1bb6899b00b876ff&o=',address:'Khayaban-e-Suhrawardy, Islamabad',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Pool','Gym','Spa','Balcony','Breakfast','Concierge'],price:{standard:24000,deluxe:44000,suite:88000,penthouse:175000,currency:'PKR'}},
  { _id:'pk_h013',cityId:3,cityName:'Islamabad',name:'Islamabad Marriott Hotel',stars:5,rating:4.5,image:'https://www.ticati.com/img/hotel/1499440s.jpg',address:'Aga Khan Road, Islamabad',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Jacuzzi','King Bed','Pool','Gym','Concierge'],price:{standard:25000,deluxe:45000,suite:90000,penthouse:190000,currency:'PKR'}},
  { _id:'pk_h014',cityId:3,cityName:'Islamabad',name:'Grand Hyatt Islamabad',stars:5,rating:4.7,image:'https://images.unsplash.com/photo-1571896349842-33c89424de2d',address:'Constitution Avenue, Islamabad',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Balcony','Jacuzzi','Living Area','Spa','Pool','Concierge'],price:{standard:26000,deluxe:46000,suite:92000,penthouse:195000,currency:'PKR'}},
  { _id:'pk_h015',cityId:3,cityName:'Islamabad',name:'Roomy Signature Islamabad',stars:4,rating:4.3,image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/d5/79/8c/roomy-signature.jpg?w=900&h=-1&s=1',address:'Blue Area, Islamabad',amenities:['WiFi','TV','Air Conditioning','Work Desk','Safe','Coffee Maker'],price:{standard:16000,deluxe:29000,suite:57000,currency:'PKR'}},
  { _id:'pk_h016',cityId:3,cityName:'Islamabad',name:'The Envoy Hotel Islamabad',stars:4,rating:4.4,image:'https://images.unsplash.com/photo-1564501049412-61c2a3083791',address:'Diplomatic Enclave, Islamabad',amenities:['WiFi','TV','Air Conditioning','Room Service','Work Desk','Safe','Coffee Maker'],price:{standard:18000,deluxe:32000,suite:62000,currency:'PKR'}},
  // ── Peshawar ──
  { _id:'pk_h017',cityId:4,cityName:'Peshawar',name:'Pearl Continental Peshawar',stars:5,rating:4.4,image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpwbE02rXw9lSeHwHHmgE9UROtSPVm3PGkwA&s',address:'Khyber Road, Peshawar',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Pool','Gym','Safe','Concierge'],price:{standard:17000,deluxe:30000,suite:58000,penthouse:120000,currency:'PKR'}},
  { _id:'pk_h018',cityId:4,cityName:'Peshawar',name:'Fort Continental Peshawar',stars:4,rating:4.2,image:'https://pix10.agoda.net/hotelImages/30194698/0/eacd29d9668edf236526bc6e61735d71.jpg?ca=26&ce=0&s=1024x768',address:'GT Road, Peshawar',amenities:['WiFi','TV','Air Conditioning','Room Service','Safe','Coffee Maker'],price:{standard:13000,deluxe:24000,suite:47000,currency:'PKR'}},
  { _id:'pk_h019',cityId:4,cityName:'Peshawar',name:'The Khyber Hotel Peshawar',stars:4,rating:4.3,image:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',address:'Saddar Road, Peshawar',amenities:['WiFi','TV','Air Conditioning','Room Service','Work Desk','Safe'],price:{standard:14000,deluxe:26000,suite:50000,currency:'PKR'}},
  { _id:'pk_h020',cityId:4,cityName:'Peshawar',name:'The Grand Hotel Peshawar',stars:4,rating:4.1,image:'https://images.unsplash.com/photo-1564501049412-61c2a3083791',address:'University Road, Peshawar',amenities:['WiFi','TV','Air Conditioning','Room Service','Work Desk','Parking'],price:{standard:12000,deluxe:22000,suite:44000,currency:'PKR'}},
  // ── Quetta ──
  { _id:'pk_h021',cityId:5,cityName:'Quetta',name:'Serena Quetta',stars:5,rating:4.5,image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/72/e4/d7/quetta-serena-hotel.jpg?w=700&h=-1&s=1',address:'Shahrah-e-Zarghoon, Quetta',amenities:['WiFi','TV','Air Conditioning','Mini Bar','Room Service','Pool','Gym','Safe','Work Desk','Breakfast'],price:{standard:18000,deluxe:33000,suite:65000,penthouse:130000,currency:'PKR'}},
  { _id:'pk_h022',cityId:5,cityName:'Quetta',name:'Bloom Star Hotel Quetta',stars:4,rating:4.2,image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/d1/c8/37/garden.jpg?w=900&h=-1&s=1',address:'Airport Road, Quetta',amenities:['WiFi','TV','Air Conditioning','Room Service','Work Desk','Safe'],price:{standard:13000,deluxe:24000,suite:48000,currency:'PKR'}},
  { _id:'pk_h023',cityId:5,cityName:'Quetta',name:'Quetta International Hotel',stars:4,rating:4.1,image:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',address:'Jinnah Road, Quetta',amenities:['WiFi','TV','Air Conditioning','Room Service','Safe','Coffee Maker'],price:{standard:12000,deluxe:21000,suite:42000,currency:'PKR'}},
  { _id:'pk_h024',cityId:5,cityName:'Quetta',name:'The Hanna Lake Resort',stars:4,rating:4.3,image:'https://images.unsplash.com/photo-1586375300773-8384e3e4916f',address:'Hanna Lake Road, Quetta',amenities:['WiFi','TV','Air Conditioning','Room Service','Balcony','Parking','Breakfast'],price:{standard:14000,deluxe:25000,suite:50000,currency:'PKR'}},
]

// ─── mockRooms: hotel index hi → pool[hi] = unique image, never repeated ─────
export const mockRooms = pakistanHotels.flatMap((hotel, hi) => {
  const city     = pakistanCities.find(c => c.id === hotel.cityId)
  const province = city?.province || ''

  const gallery = (main, b, v, l) => [
    main,
    BATH[b % BATH.length],
    VIEW[v % VIEW.length],
    LOUNGE[l % LOUNGE.length],
  ]

  const rows = [
    {
      id:`${hotel._id}_std`, _id:`${hotel._id}_std`,
      number:`${(hi+1)*100+1}`, name:`Standard Room – ${hotel.name}`,
      hotelName:hotel.name, hotelId:hotel._id,
      type:'standard', floor:1, status:'available',
      price:hotel.price.standard, capacity:2, bedType:'Double', size:280,
      amenities:['WiFi','TV','Air Conditioning','Safe'],
      description:`Comfortable standard room at ${hotel.name}, ${hotel.cityName}. Plush double bed, flat-screen TV, high-speed WiFi and a modern en-suite bathroom — everything you need for a productive business trip or relaxing getaway.`,
      images: gallery(STD_IMGS[hi % STD_IMGS.length], hi, hi+1, hi+2),
      rating:parseFloat(Math.max(3.5,hotel.rating-0.2).toFixed(1)),
      reviews:45+hi*7, city:hotel.cityName, province, address:hotel.address,
    },
    {
      id:`${hotel._id}_dlx`, _id:`${hotel._id}_dlx`,
      number:`${(hi+1)*100+2}`, name:`Deluxe Room – ${hotel.name}`,
      hotelName:hotel.name, hotelId:hotel._id,
      type:'deluxe', floor:2, status:'available',
      price:hotel.price.deluxe, capacity:2, bedType:'King', size:380,
      amenities:hotel.amenities.slice(0,7),
      description:`Elegant deluxe room at ${hotel.name} with a king-size bed, premium linens and a stunning city view. Mini bar, work desk and deluxe bathroom — ideal for couples and leisure travellers who demand more.`,
      images: gallery(DLX_IMGS[hi % DLX_IMGS.length], (hi+2)%5, (hi+3)%5, (hi+4)%5),
      rating:hotel.rating,
      reviews:80+hi*5, city:hotel.cityName, province, address:hotel.address,
    },
    {
      id:`${hotel._id}_ste`, _id:`${hotel._id}_ste`,
      number:`${(hi+1)*100+3}`, name:`Suite – ${hotel.name}`,
      hotelName:hotel.name, hotelId:hotel._id,
      type:'suite', floor:5, status:'available',
      price:hotel.price.suite, capacity:3, bedType:'King', size:650,
      amenities:hotel.amenities,
      description:`Luxurious suite at ${hotel.name} with a separate living area, panoramic city views and the finest upscale amenities. King-size bed, oversized jacuzzi and round-the-clock butler service make this an unforgettable stay.`,
      images: gallery(STE_IMGS[hi % STE_IMGS.length], (hi+1)%5, (hi+2)%5, (hi+3)%5),
      rating:parseFloat(Math.min(5,hotel.rating+0.1).toFixed(1)),
      reviews:60+hi*4, city:hotel.cityName, province, address:hotel.address,
    },
  ]

  if (hotel.price.penthouse) {
    rows.push({
      id:`${hotel._id}_pnt`, _id:`${hotel._id}_pnt`,
      number:`${(hi+1)*100+4}`, name:`Penthouse – ${hotel.name}`,
      hotelName:hotel.name, hotelId:hotel._id,
      type:'penthouse', floor:Math.max(10,hi+8), status:'available',
      price:hotel.price.penthouse, capacity:4, bedType:'King', size:1200,
      amenities:[...new Set([...hotel.amenities,'Kitchenette','Living Area','Concierge'])],
      description:`Exclusive penthouse at ${hotel.name} — the pinnacle of luxury. Floor-to-ceiling windows reveal breathtaking skyline views. Private terrace, personal butler, fully-equipped kitchen and separate bedrooms for up to 4 guests.`,
      images: gallery(PNT_IMGS[hi % PNT_IMGS.length], (hi+3)%5, (hi+4)%5, hi%5),
      rating:parseFloat(Math.min(5,hotel.rating+0.2).toFixed(1)),
      reviews:30+hi*3, city:hotel.cityName, province, address:hotel.address,
    })
  }

  return rows
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getHotelsByCity    = (cityId)   => pakistanHotels.filter(h => h.cityId === cityId)
export const getRoomsByHotel    = (hotelId)  => mockRooms.filter(r => r.id.startsWith(hotelId))
export const getRoomsByCity     = (cityName) => mockRooms.filter(r => r.city === cityName)
export const getRoomsByProvince = (province) => mockRooms.filter(r => r.province === province)
export const getRoomById        = (id)       => mockRooms.find(r => r.id === id || r._id === id)
export const formatPKR          = (amount)   => `PKR ${Number(amount).toLocaleString('en-PK')}`

export const mockStaff  = []
export const mockGuests = []