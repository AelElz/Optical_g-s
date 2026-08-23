/*
 * French copy. This is the source language: every string here is the shop's
 * own wording from opticalgs.com, and en.js is the translation.
 *
 * en.js must stay the same shape as this file, down to array lengths, or one
 * language silently renders nothing where the other has a string.
 *
 * Two house rules.
 *
 * No dash as a connector. Not the em dash, not the en dash, not a double
 * hyphen. Where one used to join two halves of a sentence the sentence is
 * split, or a comma does the work, or a middot separates two facts. Ranges
 * are written out: "10:00 a 20:00", never "10:00-20:00".
 *
 * French sets a no-break space before ? ! : and ;. It is written as the
 * escape and never as the character: an invisible space in a source file is
 * deleted by accident and never noticed.
 */
const nb = '\u00A0'

/* The separator that replaced the dash. A middot with hair spaces around it,
   which is what a printed price list uses. */
const dot = `${nb}\u00B7 `

export default {
  meta: {
    title: `Optical G&S${nb}· Vos yeux méritent le mieux`,
    description:
      'Optical G&S, opticien à Casablanca. Examen de la vue, lunettes de vue et de soleil, lentilles de contact. Boutique en ligne et livraison au Maroc.',
  },

  /* Shared across every page: the nav, the footer and three contact blocks
     all read from here, so the address exists once. */
  shop: {
    name: 'Optical G&S',
    tagline: 'Vos yeux méritent le mieux',
    address: 'Angle Bd Qods & Bd Haifa, Résidence El Rosier, Magasin N°2, Californie, Casablanca',
    city: 'Casablanca, Maroc',
    phones: ['+212666868630', '+212750914702'],
    whatsapp: '+212750914702',
    email: 'contact@opticalgs.com',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Angle+Bd+Qods+%26+Bd+Haifa,+R%C3%A9sidence+El+Rosier,+Californie,+Casablanca',
    closedNote: 'Fermé le dimanche. Disponible sur WhatsApp 7j/7',
    hoursTitle: "Horaires d'ouverture",
    hours: [
      { day: 'Dimanche', time: 'Fermé', closed: true },
      { day: 'Lundi', time: '10:00 à 20:00', closed: false },
      { day: 'Mardi', time: '10:00 à 20:00', closed: false },
      { day: 'Mercredi', time: '10:00 à 20:00', closed: false },
      { day: 'Jeudi', time: '10:00 à 20:00', closed: false },
      { day: 'Vendredi', time: '10:00 à 20:00', closed: false },
      { day: 'Samedi', time: '10:00 à 20:00', closed: false },
    ],
    social: [
      { name: 'Instagram', url: 'https://www.instagram.com/optical.gs/' },
      { name: 'Facebook', url: 'https://m.facebook.com/Optical.GS' },
      { name: 'WhatsApp', url: 'https://wa.me/212750914702' },
    ],
  },

  nav: {
    /* Paths are locale-independent: /boutique is /boutique in both languages,
       because the router matches the path and there is no English twin to
       match. Only the label translates. */
    links: [
      { path: '/', label: 'Accueil' },
      { path: '/boutique', label: 'Boutique' },
      { path: '/rendez-vous', label: 'Rendez-vous' },
      { path: '/a-propos', label: 'À Propos' },
      { path: '/contact', label: 'Contact' },
    ],
    cta: 'Prendre rendez-vous',
    cart: 'Panier',
    cartCount: (n) => `Panier, ${n} article${n > 1 ? 's' : ''}`,
    menu: 'Menu',
    close: 'Fermer',
    home: "Optical G&S, retour à l'accueil",
    themeToDark: 'Passer au thème sombre',
    themeToLight: 'Passer au thème clair',
    langLabel: 'Langue',
    skip: 'Aller au contenu',
  },

  topbar: `Lundi au samedi, 10h à 20h${dot}WhatsApp +212 750 914 702`,

  home: {
    hero: {
      kicker: `Opticienne diplômée${dot}Casablanca`,
      title: 'Vos yeux méritent le mieux',
      lede:
        "Examen de la vue, montures de créateurs et lentilles de contact, dans un magasin où l'on prend le temps de vous conseiller.",
      primary: 'Prendre rendez-vous',
      secondary: 'Voir la boutique',
      scroll: 'Découvrir',
      frameLabel: 'La monture du moment',
    },
    craft: {
      kicker: 'Le savoir-faire Optical G&S',
      title: 'Notre magasin à Casablanca',
      body:
        "Optical G&S est une marque d'optique née au Maroc avec une ambition internationale. Notre mission est simple : rendre des lunettes de haute qualité, stylées et abordables accessibles à tous, partout. Depuis notre magasin phare à Casablanca, nous vous accueillons du lundi au samedi pour un service personnalisé et expert.",
      photos: [
        { src: '/media/store-1.webp', alt: 'La devanture du magasin Optical G&S à Casablanca' },
        {
          src: '/media/hero.webp',
          alt: "L'intérieur du magasin, présentoirs de montures et espace conseil",
        },
        { src: '/media/store-2.webp', alt: 'Espace essayage et présentoirs de solaires' },
      ],
    },
    services: {
      kicker: 'Ce que nous faisons',
      title: 'Services spécialisés',
      lede: 'Six prestations, toutes assurées en magasin par une opticienne diplômée.',
      items: [
        { n: 1, name: 'Examen de la vue', note: 'Bilan visuel complet', duration: '60 min' },
        { n: 2, name: 'Lunettes de vue', note: 'Montures et verres correcteurs', duration: '' },
        { n: 3, name: 'Lunettes de soleil', note: 'Solaires et solaires à votre vue', duration: '' },
        { n: 4, name: 'Lentilles de contact', note: 'Adaptation et suivi', duration: '30 min' },
        { n: 5, name: 'Lunettes sur mesure', note: 'Montures ajustées à votre visage', duration: '' },
        {
          n: 6,
          name: 'Réglage & réparation',
          note: 'Ajustement, soudure, plaquettes',
          duration: '15 min',
        },
      ],
    },
    founder: {
      kicker: "Opticienne diplômée, fondatrice d'Optical G&S",
      name: 'Ghanem Sara',
      body:
        "Passionnée par la santé visuelle depuis plus de 10 ans, Sara Ghanem a fondé Optical G&S avec une vision claire : offrir à chaque client un accompagnement personnalisé, des montures de qualité et un service à la hauteur de ses attentes. Diplômée en optique-lunetterie, elle met son expertise au service de votre confort visuel au quotidien, que ce soit pour un premier examen de la vue, le choix d'une paire de lunettes ou l'adaptation de lentilles de contact.",
      link: 'Découvrir notre histoire',
      photoAlt: "Sara Ghanem, opticienne diplômée et fondatrice d'Optical G&S",
    },
    booking: {
      kicker: 'Sur rendez-vous',
      title: 'Réservez votre consultation',
      lede: 'Prenez rendez-vous en ligne pour un bilan visuel ou un conseil personnalisé.',
      primary: 'Prendre rendez-vous',
      secondary: 'Nous écrire sur WhatsApp',
    },
    find: {
      kicker: 'Nous trouver',
      title: 'Nous trouver à Casablanca',
      call: 'Appeler maintenant',
      directions: "Voir l'itinéraire",
      mapLabel: 'Carte Google Maps',
      mapNote: 'Ouvrir dans Google Maps',
    },
    shopTeaser: {
      kicker: 'Boutique',
      title: "L'élégance à portée de vue",
      lede:
        "Découvrez notre sélection de lunettes de vue, de soleil et d'accessoires directement en ligne. Livraison au Maroc.",
      cta: 'Explorer maintenant',
      count: (n) => `${n} montures en ligne`,
    },
  },

  boutique: {
    meta: {
      title: `Boutique en ligne${nb}· Optical G&S`,
      description:
        "Lunettes de vue, lunettes de soleil et montures de créateurs. Jusqu'à 30% de remise, livraison partout au Maroc.",
    },
    hero: {
      badge: "Jusqu'à 30% de remise",
      title: 'Lunettes homme & femme',
      lede: 'Des prix imbattables. Livraison partout au Maroc.',
      cta: 'Voir les montures',
    },
    categories: {
      kicker: 'Par catégorie',
      title: 'Explorez notre sélection',
      items: [
        {
          n: 1,
          key: 'uv',
          label: 'Lunettes de vue avec protection UV',
          genre: 'all',
          type: 'optical',
        },
        { n: 2, key: 'vue-femme', label: 'Lunettes de vue femme', genre: 'female', type: 'optical' },
        {
          n: 3,
          key: 'soleil-femme',
          label: 'Lunettes de soleil femme',
          genre: 'female',
          type: 'sunglass',
        },
        { n: 4, key: 'vue-homme', label: 'Lunettes de vue homme', genre: 'male', type: 'optical' },
        {
          n: 5,
          key: 'soleil-homme',
          label: 'Lunettes de soleil homme',
          genre: 'male',
          type: 'sunglass',
        },
        { n: 6, key: 'enfant', label: 'Lunettes enfant', genre: 'child', type: 'all' },
      ],
    },
    filters: {
      genreLabel: 'Genre',
      typeLabel: 'Type',
      sortLabel: 'Trier',
      /* Values are locale-independent so a language switch keeps the
         selection. Only `label` translates. */
      genre: [
        { value: 'all', label: 'Tous' },
        { value: 'male', label: 'Homme' },
        { value: 'female', label: 'Femme' },
        { value: 'child', label: 'Enfant' },
      ],
      type: [
        { value: 'all', label: 'Tous' },
        { value: 'optical', label: 'Lunettes de vue' },
        { value: 'sunglass', label: 'Lunettes de soleil' },
      ],
      sort: [
        { value: 'recent', label: 'Plus récents' },
        { value: 'featured', label: 'Mis en avant' },
        { value: 'price-asc', label: 'Prix croissant' },
        { value: 'price-desc', label: 'Prix décroissant' },
      ],
      reset: 'Tout effacer',
      results: (n) => `${n} monture${n > 1 ? 's' : ''}`,
      empty: 'Aucune monture ne correspond à ces filtres.',
    },
    card: {
      add: 'Ajouter',
      added: 'Ajouté',
      view: 'Voir la monture',
      soldOut: 'Épuisé',
      onRequest: 'Prix sur demande',
    },
    quickView: {
      close: 'Fermer',
      reference: 'Référence',
      material: 'Matière',
      colour: 'Couleur',
      measurements: 'Dimensions',
      measurementsNote: `Verre${dot}Pont${dot}Branches`,
      stock: 'Stock',
      add: 'Ajouter au panier',
      cart: 'Voir le panier',
      ask: 'Demander cette monture',
    },
    pagination: {
      previous: 'Précédent',
      next: 'Suivant',
      page: (n) => `Page ${n}`,
    },
  },

  rendezVous: {
    meta: {
      title: `Prendre rendez-vous${nb}· Optical G&S`,
      description:
        'Réservez un examen de la vue, un conseil en montures ou une adaptation de lentilles dans notre magasin de Casablanca.',
    },
    kicker: 'Réservez votre consultation',
    title: 'La clarté, définie par la précision',
    lede:
      'Choisissez un créneau pour votre bilan visuel complet ou votre conseil en montures dans notre magasin de Casablanca.',
    formTitle: 'Demande de rendez-vous',
    fields: {
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      service: 'Service',
      date: 'Date du rendez-vous',
      time: 'Heure',
      timePlaceholder: 'Choisir',
      notes: 'Notes (optionnel)',
      notesPlaceholder: `Une précision utile avant votre venue${nb}?`,
    },
    services: [
      { n: 1, name: 'Examen de la vue', duration: '60 min' },
      { n: 2, name: 'Conseil montures', duration: '30 min' },
      { n: 3, name: 'Adaptation lentilles', duration: '30 min' },
      { n: 4, name: 'Réparation, réglage', duration: '15 min' },
    ],
    submit: 'Confirmer la réservation',
    whatsapp: 'Réserver sur WhatsApp',
    storeTitle: 'Notre magasin',
    note:
      'Votre demande part par email ou WhatsApp depuis votre propre appareil. Nous la confirmons sous 24 heures ouvrées.',
    success:
      "Votre demande est prête. Terminez l'envoi dans l'application qui vient de s'ouvrir et nous vous confirmons le créneau.",
    errors: {
      generic: "Merci de vérifier les champs marqués avant d'envoyer.",
      name: 'Indiquez votre nom.',
      email: 'Indiquez un email valide.',
      phone: 'Indiquez un numéro joignable.',
      date: 'Choisissez une date.',
      time: 'Choisissez une heure.',
      past: 'Choisissez une date à venir.',
      closed: 'Le magasin est fermé le dimanche. Choisissez un autre jour.',
    },
  },

  aPropos: {
    meta: {
      title: `À propos${nb}· Optical G&S`,
      description:
        "Optical G&S est une marque d'optique marocaine basée à Casablanca : qualité premium, prix accessibles et conseil personnalisé.",
    },
    kicker: "L'optique marocaine pensée pour vous",
    title: "À propos d'Optical G&S",
    intro:
      "Optical G&S est une marque d'optique marocaine basée à Casablanca. Notre mission est simple : rendre des lunettes de haute qualité, stylées et abordables accessibles à tous. Nous sélectionnons chaque monture avec soin pour vous offrir un excellent rapport qualité-prix, un service personnalisé en magasin et une livraison rapide partout au Maroc.",
    whyKicker: 'Nos engagements',
    whyTitle: `Pourquoi choisir Optical G&S${nb}?`,
    why: [
      { n: 1, title: 'Qualité premium', body: 'Montures stylées et durables pour un usage quotidien.' },
      {
        n: 2,
        title: 'Prix accessibles',
        body: "Prix imbattables sans sacrifier la qualité, jusqu'à 30% de remise.",
      },
      {
        n: 3,
        title: 'Conseil personnalisé',
        body: 'Notre équipe vous accompagne pour trouver la monture qui vous convient.',
      },
      {
        n: 4,
        title: 'Support excellent',
        body: 'Paiement à la livraison disponible. Service client réactif sur WhatsApp.',
      },
    ],
    selectionKicker: 'Ce que nous proposons',
    selectionTitle: 'Notre sélection',
    selection: [
      { n: 1, label: 'Lunettes de prescription (vue)' },
      { n: 2, label: 'Lunettes de soleil' },
      { n: 3, label: 'Lunettes filtrant la lumière bleue' },
      { n: 4, label: 'Lentilles de contact journalières et mensuelles' },
      { n: 5, label: 'Lunettes pour enfants' },
      { n: 6, label: 'Accessoires optiques' },
    ],
    storeKicker: 'Nous rendre visite',
    storeTitle: 'Notre magasin',
    storeName: 'Magasin de Casablanca',
    cta: 'Voir la boutique',
  },

  contact: {
    meta: {
      title: `Contact${nb}· Optical G&S`,
      description:
        'Écrivez-nous, appelez-nous ou passez au magasin : Angle Bd Qods & Bd Haifa, Californie, Casablanca.',
    },
    kicker: 'Nous écrire',
    title: 'On est là pour vous',
    lede: `Une question sur une monture, un verre ou un rendez-vous${nb}? Écrivez-nous, nous répondons vite.`,
    formTitle: 'Votre message',
    fields: {
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      subject: 'Sujet',
      message: 'Message',
    },
    submit: 'Envoyer',
    whatsapp: 'Écrire sur WhatsApp',
    findKicker: 'Le magasin',
    findTitle: 'Nous trouver à Casablanca',
    call: 'Appeler maintenant',
    directions: "Voir l'itinéraire",
    mapLabel: 'Carte Google Maps',
    note: "Votre message s'ouvre dans votre application de messagerie. Rien n'est envoyé par ce site.",
    success: "Votre message est prêt. Terminez l'envoi dans l'application qui vient de s'ouvrir.",
    errors: {
      generic: "Merci de vérifier les champs marqués avant d'envoyer.",
      name: 'Indiquez votre nom.',
      email: 'Indiquez un email valide.',
      message: 'Écrivez votre message.',
    },
  },

  panier: {
    meta: {
      title: `Votre panier${nb}· Optical G&S`,
      description: 'Votre sélection de montures Optical G&S, prête pour la commande.',
    },
    kicker: 'Votre sélection',
    title: 'Votre panier',
    empty: 'Votre panier est vide',
    emptyNote: 'Parcourez la boutique et ajoutez les montures qui vous plaisent.',
    emptyCta: 'Voir la boutique',
    lineQuantity: 'Quantité',
    increase: 'Augmenter la quantité',
    decrease: 'Diminuer la quantité',
    remove: 'Retirer',
    removed: (name) => `${name} retiré du panier`,
    clear: 'Vider le panier',
    cleared: 'Panier vidé.',
    undo: 'Annuler',
    continue: 'Continuer mes achats',
    summaryTitle: 'Récapitulatif',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    shippingPending: 'Choisissez une ville',
    total: 'Total',
    checkoutTitle: 'Finaliser la commande',
    deliveryTitle: 'Livraison',
    paymentTitle: 'Paiement',
    payment: 'Paiement à la livraison',
    paymentNote: 'Vous réglez le livreur à la réception de votre commande.',
    fields: {
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      city: 'Ville',
      address: 'Adresse',
      postcode: 'Code postal',
      notes: 'Notes (optionnel)',
    },
    cityPlaceholder: 'Choisir une ville',
    cities: [
      { n: 1, name: 'Casablanca', fee: 30 },
      { n: 2, name: 'Rabat', fee: 40 },
      { n: 3, name: 'Marrakech', fee: 50 },
      { n: 4, name: 'Tanger', fee: 50 },
      { n: 5, name: 'Fès', fee: 50 },
    ],
    cityFee: (name, fee) => `${name}${dot}${fee} MAD`,
    submit: 'Confirmer la commande',
    whatsapp: 'Commander sur WhatsApp',
    note:
      "Votre commande part par email ou WhatsApp depuis votre propre appareil. Aucun paiement n'est demandé en ligne.",
    success:
      "Votre commande est prête. Terminez l'envoi dans l'application qui vient de s'ouvrir et nous vous rappelons pour confirmer.",
    errors: {
      generic: "Merci de vérifier les champs marqués avant d'envoyer.",
      name: 'Indiquez votre nom.',
      email: 'Indiquez un email valide.',
      phone: 'Indiquez un numéro joignable.',
      city: 'Choisissez une ville de livraison.',
      address: 'Indiquez une adresse de livraison.',
    },
  },

  notFound: {
    kicker: 'Erreur 404',
    title: 'Page introuvable',
    lede: "Cette page n'existe pas, ou plus. Reprenons depuis l'accueil.",
    cta: "Retour à l'accueil",
    shop: 'Voir la boutique',
  },

  footer: {
    linksTitle: 'Liens rapides',
    contactTitle: 'Coordonnées',
    socialTitle: 'Réseaux sociaux',
    rights: '© 2025 Optical G&S. Tous droits réservés.',
    credit: 'Casablanca, Maroc',
    top: 'Haut de page',
  },
}
