/*
 * English copy.
 *
 * Must stay the same shape as fr.js, down to array lengths and to the `value`
 * of every filter option, or one language silently renders nothing where the
 * other has a string.
 *
 * Same house rule on dashes: none as a connector. A comma, a full stop or the
 * middot separator, never an em dash, an en dash or a double hyphen. Ranges
 * are written out.
 *
 * Paths, filter values, city names and the shop's own contact details are
 * deliberately NOT translated: the router matches the path, the filters match
 * the value, and an address is an address in any language.
 */
const nb = '\u00A0'
const dot = `${nb}\u00B7 `

export default {
  meta: {
    title: `Optical G&S${nb}· Your eyes deserve the best`,
    description:
      'Optical G&S, opticians in Casablanca. Eye exams, prescription glasses, sunglasses and contact lenses. Shop online with delivery across Morocco.',
  },

  shop: {
    name: 'Optical G&S',
    tagline: 'Your eyes deserve the best',
    address: 'Angle Bd Qods & Bd Haifa, Résidence El Rosier, Magasin N°2, Californie, Casablanca',
    city: 'Casablanca, Morocco',
    phones: ['+212666868630', '+212750914702'],
    whatsapp: '+212750914702',
    email: 'contact@opticalgs.com',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Angle+Bd+Qods+%26+Bd+Haifa,+R%C3%A9sidence+El+Rosier,+Californie,+Casablanca',
    closedNote: 'Closed Sunday. Available on WhatsApp 7 days a week',
    hoursTitle: 'Opening hours',
    hours: [
      { day: 'Sunday', time: 'Closed', closed: true },
      { day: 'Monday', time: '10:00 to 20:00', closed: false },
      { day: 'Tuesday', time: '10:00 to 20:00', closed: false },
      { day: 'Wednesday', time: '10:00 to 20:00', closed: false },
      { day: 'Thursday', time: '10:00 to 20:00', closed: false },
      { day: 'Friday', time: '10:00 to 20:00', closed: false },
      { day: 'Saturday', time: '10:00 to 20:00', closed: false },
    ],
    social: [
      { name: 'Instagram', url: 'https://www.instagram.com/optical.gs/' },
      { name: 'Facebook', url: 'https://m.facebook.com/Optical.GS' },
      { name: 'WhatsApp', url: 'https://wa.me/212750914702' },
    ],
  },

  nav: {
    links: [
      { path: '/', label: 'Home' },
      { path: '/boutique', label: 'Shop' },
      { path: '/rendez-vous', label: 'Appointments' },
      { path: '/a-propos', label: 'About' },
      { path: '/contact', label: 'Contact' },
    ],
    cta: 'Book an appointment',
    cart: 'Cart',
    cartCount: (n) => `Cart, ${n} item${n > 1 ? 's' : ''}`,
    menu: 'Menu',
    close: 'Close',
    home: 'Optical G&S, back to home',
    langLabel: 'Language',
    skip: 'Skip to content',
  },

  topbar: `Monday to Saturday, 10am to 8pm${dot}WhatsApp +212 750 914 702`,

  home: {
    hero: {
      kicker: `Qualified optician${dot}Casablanca`,
      title: 'Your eyes deserve the best',
      accent: 'the best',
      pause: 'Pause the slideshow',
      play: 'Play the slideshow',
      lede:
        'Eye exams, designer frames and contact lenses, in a shop that takes the time to advise you properly.',
      primary: 'Book an appointment',
      secondary: 'Visit the shop',
      scroll: 'Explore',
      frameLabel: 'This season',
    },
    craft: {
      kicker: 'The Optical G&S craft',
      title: 'Our Casablanca store',
      body:
        'Optical G&S is an eyewear brand born in Morocco with international ambitions. Our mission is simple: to make high-quality, stylish and affordable glasses accessible to everyone, everywhere. From our flagship store in Casablanca we welcome you Monday to Saturday for personal, expert service.',
      photos: [
        { src: '/media/store-1.webp', alt: 'The Optical G&S storefront in Casablanca' },
        { src: '/media/hero.webp', alt: 'Inside the store: frame displays and the fitting area' },
        { src: '/media/store-2.webp', alt: 'Try-on area and sunglasses displays' },
      ],
    },
    services: {
      kicker: 'What we do',
      title: 'Specialized services',
      lede: 'Six services, all carried out in store by a qualified optician.',
      items: [
        { n: 1, name: 'Eye examination', note: 'Full vision assessment', duration: '60 min' },
        { n: 2, name: 'Prescription glasses', note: 'Frames and corrective lenses', duration: '' },
        { n: 3, name: 'Sunglasses', note: 'Plain or prescription', duration: '' },
        { n: 4, name: 'Contact lenses', note: 'Fitting and follow-up', duration: '30 min' },
        { n: 5, name: 'Made-to-measure', note: 'Frames fitted to your face', duration: '' },
        {
          n: 6,
          name: 'Adjustment & repair',
          note: 'Alignment, soldering, nose pads',
          duration: '15 min',
        },
      ],
    },
    founder: {
      kicker: 'Qualified optician, founder of Optical G&S',
      name: 'Ghanem Sara',
      body:
        'Passionate about eye health for over 10 years, Sara Ghanem founded Optical G&S with a clear vision: to give every client personal guidance, quality frames and service that lives up to their expectations. A qualified dispensing optician, she puts her expertise at the service of your everyday visual comfort, whether that is a first eye exam, choosing a pair of glasses, or fitting contact lenses.',
      link: 'Discover our story',
      photoAlt: 'Sara Ghanem, qualified optician and founder of Optical G&S',
    },
    booking: {
      kicker: 'By appointment',
      title: 'Book your consultation',
      lede: 'Schedule online for an eye exam or personal advice.',
      primary: 'Book an appointment',
      secondary: 'Message us on WhatsApp',
    },
    find: {
      kicker: 'Find us',
      title: 'Find us in Casablanca',
      call: 'Call now',
      directions: 'Get directions',
      mapLabel: 'Google Maps',
      mapNote: 'Open in Google Maps',
    },
    shopTeaser: {
      kicker: 'Shop',
      title: 'Elegance within sight',
      lede:
        'Browse our selection of prescription glasses, sunglasses and accessories online. Delivery across Morocco.',
      cta: 'Explore now',
      count: (n) => `${n} frames online`,
    },
  },

  boutique: {
    meta: {
      title: `Online shop${nb}· Optical G&S`,
      description:
        'Prescription glasses, sunglasses and designer frames. Up to 30% off, delivered across Morocco.',
    },
    hero: {
      badge: 'Up to 30% off',
      title: 'Eyewear for men & women',
      accent: '&',
      lede: 'Unbeatable prices. Delivered across Morocco.',
      cta: 'Browse the frames',
    },
    categories: {
      kicker: 'By category',
      title: 'Explore our selection',
      items: [
        {
          n: 1,
          key: 'uv',
          label: 'Prescription glasses with UV protection',
          genre: 'all',
          type: 'optical',
        },
        {
          n: 2,
          key: 'vue-femme',
          label: "Women's prescription glasses",
          genre: 'female',
          type: 'optical',
        },
        { n: 3, key: 'soleil-femme', label: "Women's sunglasses", genre: 'female', type: 'sunglass' },
        {
          n: 4,
          key: 'vue-homme',
          label: "Men's prescription glasses",
          genre: 'male',
          type: 'optical',
        },
        { n: 5, key: 'soleil-homme', label: "Men's sunglasses", genre: 'male', type: 'sunglass' },
        { n: 6, key: 'enfant', label: "Children's glasses", genre: 'child', type: 'all' },
      ],
    },
    filters: {
      genreLabel: 'Gender',
      typeLabel: 'Type',
      sortLabel: 'Sort',
      genre: [
        { value: 'all', label: 'All' },
        { value: 'male', label: 'Men' },
        { value: 'female', label: 'Women' },
        { value: 'child', label: 'Children' },
      ],
      type: [
        { value: 'all', label: 'All' },
        { value: 'optical', label: 'Prescription' },
        { value: 'sunglass', label: 'Sunglasses' },
      ],
      sort: [
        { value: 'recent', label: 'Newest' },
        { value: 'featured', label: 'Featured' },
        { value: 'price-asc', label: 'Price, low to high' },
        { value: 'price-desc', label: 'Price, high to low' },
      ],
      reset: 'Clear all',
      results: (n) => `${n} frame${n > 1 ? 's' : ''}`,
      empty: 'No frames match these filters.',
    },
    card: {
      add: 'Add',
      added: 'Added',
      view: 'View frame',
      soldOut: 'Sold out',
      onRequest: 'Price on request',
    },
    quickView: {
      close: 'Close',
      reference: 'Reference',
      material: 'Material',
      colour: 'Colour',
      measurements: 'Measurements',
      measurementsNote: `Lens${dot}Bridge${dot}Temple`,
      stock: 'In stock',
      add: 'Add to cart',
      cart: 'View cart',
      ask: 'Ask about this frame',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      page: (n) => `Page ${n}`,
    },
  },

  rendezVous: {
    meta: {
      title: `Book an appointment${nb}· Optical G&S`,
      description:
        'Book an eye exam, frame consultation or contact lens fitting at our Casablanca store.',
    },
    kicker: 'Book your consultation',
    title: 'Clarity, defined by precision',
    lede:
      'Choose a slot for your full eye examination or frame consultation at our Casablanca store.',
    formTitle: 'Appointment request',
    fields: {
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      service: 'Service',
      date: 'Appointment date',
      time: 'Time',
      timePlaceholder: 'Choose',
      notes: 'Notes (optional)',
      notesPlaceholder: 'Anything useful for us to know beforehand?',
    },
    services: [
      { n: 1, name: 'Eye examination', duration: '60 min' },
      { n: 2, name: 'Frame consultation', duration: '30 min' },
      { n: 3, name: 'Contact lens fitting', duration: '30 min' },
      { n: 4, name: 'Repair, adjustment', duration: '15 min' },
    ],
    submit: 'Confirm booking',
    whatsapp: 'Book on WhatsApp',
    storeTitle: 'Our store',
    note:
      'Your request is sent by email or WhatsApp from your own device. We confirm within one working day.',
    success:
      'Your request is ready. Finish sending it in the app that just opened and we will confirm the slot.',
    errors: {
      generic: 'Please check the marked fields before sending.',
      name: 'Please give your name.',
      email: 'Please give a valid email.',
      phone: 'Please give a number we can reach you on.',
      date: 'Please choose a date.',
      time: 'Please choose a time.',
      past: 'Please choose a date in the future.',
      closed: 'The store is closed on Sundays. Please pick another day.',
    },
  },

  aPropos: {
    meta: {
      title: `About${nb}· Optical G&S`,
      description:
        'Optical G&S is a Moroccan eyewear brand based in Casablanca: premium quality, accessible prices and personal advice.',
    },
    kicker: 'Moroccan eyewear, made for you',
    title: 'About Optical G&S',
    intro:
      'Optical G&S is a Moroccan eyewear brand based in Casablanca. Our mission is simple: to make high-quality, stylish and affordable glasses accessible to everyone. We choose every frame with care to give you excellent value, personal service in store, and fast delivery anywhere in Morocco.',
    whyKicker: 'Our commitments',
    whyTitle: 'Why choose Optical G&S?',
    why: [
      { n: 1, title: 'Premium quality', body: 'Stylish, durable frames built for everyday wear.' },
      {
        n: 2,
        title: 'Accessible prices',
        body: 'Unbeatable prices without sacrificing quality, up to 30% off.',
      },
      {
        n: 3,
        title: 'Personal advice',
        body: 'Our team helps you find the frame that suits you.',
      },
      {
        n: 4,
        title: 'Excellent support',
        body: 'Cash on delivery available. Responsive customer care on WhatsApp.',
      },
    ],
    selectionKicker: 'What we carry',
    selectionTitle: 'Our selection',
    selection: [
      { n: 1, label: 'Prescription glasses' },
      { n: 2, label: 'Sunglasses' },
      { n: 3, label: 'Blue-light filtering glasses' },
      { n: 4, label: 'Daily and monthly contact lenses' },
      { n: 5, label: "Children's glasses" },
      { n: 6, label: 'Optical accessories' },
    ],
    storeKicker: 'Visit us',
    storeTitle: 'Our store',
    storeName: 'Casablanca store',
    cta: 'Visit the shop',
  },

  contact: {
    meta: {
      title: `Contact${nb}· Optical G&S`,
      description:
        'Write, call or visit the store: Angle Bd Qods & Bd Haifa, Californie, Casablanca.',
    },
    kicker: 'Write to us',
    title: 'We are here for you',
    lede: 'A question about a frame, a lens or an appointment? Write to us, we answer quickly.',
    formTitle: 'Your message',
    fields: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Message',
    },
    submit: 'Send',
    whatsapp: 'Message on WhatsApp',
    findKicker: 'The store',
    findTitle: 'Find us in Casablanca',
    call: 'Call now',
    directions: 'Get directions',
    mapLabel: 'Google Maps',
    note: 'Your message opens in your own mail app. Nothing is sent by this site.',
    success: 'Your message is ready. Finish sending it in the app that just opened.',
    errors: {
      generic: 'Please check the marked fields before sending.',
      name: 'Please give your name.',
      email: 'Please give a valid email.',
      message: 'Please write your message.',
    },
  },

  panier: {
    meta: {
      title: `Your cart${nb}· Optical G&S`,
      description: 'Your selection of Optical G&S frames, ready to order.',
    },
    kicker: 'Your selection',
    title: 'Your cart',
    empty: 'Your cart is empty',
    emptyNote: 'Browse the shop and add the frames you like.',
    emptyCta: 'Visit the shop',
    lineQuantity: 'Quantity',
    increase: 'Increase quantity',
    decrease: 'Decrease quantity',
    remove: 'Remove',
    removed: (name) => `${name} removed from the cart`,
    clear: 'Empty the cart',
    cleared: 'Cart emptied.',
    undo: 'Undo',
    continue: 'Continue shopping',
    summaryTitle: 'Summary',
    subtotal: 'Subtotal',
    shipping: 'Delivery',
    shippingPending: 'Choose a city',
    total: 'Total',
    checkoutTitle: 'Complete your order',
    deliveryTitle: 'Delivery',
    paymentTitle: 'Payment',
    payment: 'Cash on delivery',
    paymentNote: 'You pay the courier when your order arrives.',
    fields: {
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      address: 'Address',
      postcode: 'Postcode',
      notes: 'Notes (optional)',
    },
    cityPlaceholder: 'Choose a city',
    cities: [
      { n: 1, name: 'Casablanca', fee: 30 },
      { n: 2, name: 'Rabat', fee: 40 },
      { n: 3, name: 'Marrakech', fee: 50 },
      { n: 4, name: 'Tanger', fee: 50 },
      { n: 5, name: 'Fès', fee: 50 },
    ],
    cityFee: (name, fee) => `${name}${dot}${fee} MAD`,
    submit: 'Confirm order',
    whatsapp: 'Order on WhatsApp',
    note:
      'Your order is sent by email or WhatsApp from your own device. No payment is taken online.',
    success:
      'Your order is ready. Finish sending it in the app that just opened and we will call you to confirm.',
    errors: {
      generic: 'Please check the marked fields before sending.',
      name: 'Please give your name.',
      email: 'Please give a valid email.',
      phone: 'Please give a number we can reach you on.',
      city: 'Please choose a delivery city.',
      address: 'Please give a delivery address.',
    },
  },

  notFound: {
    kicker: 'Error 404',
    title: 'Page not found',
    lede: 'This page does not exist, or no longer does. Let us start again from home.',
    cta: 'Back to home',
    shop: 'Visit the shop',
  },

  footer: {
    linksTitle: 'Quick links',
    contactTitle: 'Contact',
    socialTitle: 'Social',
    rights: '© 2025 Optical G&S. All rights reserved.',
    credit: 'Casablanca, Morocco',
    top: 'Back to top',
  },
}
