// Kinyarwanda translations. Typed against the English keys, so a missing key
// fails the TypeScript build. Wording should be reviewed by a Kinyarwanda
// speaker on the team before the presentation.
import type { Messages } from "@/i18n/locales/en"

export const rw: Messages = {
  // App shell
  "app.title": "Itsinda Ryacu · Kuzigama mu itsinda",
  "app.skipToContent": "Simbukira ku bikubiyemo",
  "notFound.eyebrow": "404 · URUPAPURO NTIRUBONETSE",
  "notFound.title": "Uru rupapuro ntirurahari.",
  "notFound.body": "Reba aderesi cyangwa usubire ku rupapuro rwo kwinjira.",
  "notFound.back": "Subira ku kwinjira",

  // Shared
  "language.label": "Ururimi",
  "nav.overview": "Incamake",
  "nav.main": "Menu nyamukuru",
  "nav.open": "Fungura menu",
  "nav.group": "Menu y’itsinda",
  "nav.groupPages": "Impapuro z’itsinda",
  "nav.workspace": "Ahakorerwa",
  "action.signIn": "Injira",
  "action.logOut": "Sohoka",
  "password.show": "Erekana ijambobanga",
  "password.hide": "Hisha ijambobanga",
  "role.admin": "Umuyobozi w’itsinda",
  "role.member": "Umunyamuryango w’itsinda",
  "role.chairperson": "Perezida",
  "role.treasurer": "Umubitsi",
  "role.secretary": "Umunyamabanga",

  // Auth layout
  "auth.taglineOne": "Muzigame hamwe.",
  "auth.taglineTwo": "Mukure hamwe.",
  "auth.illustrationAlt":
    "Abanyamuryango b’itsinda batanga imisanzu mu kigega rusange cyo kuzigama",
  "auth.memberAccess": "Aho abanyamuryango binjirira",
  "auth.footer": "© 2026 Itsinda Ryacu",

  // Login
  "login.title": "Injira",
  "login.email": "Imeri",
  "login.password": "Ijambobanga",
  "login.passwordPlaceholder": "Andika ijambobanga ryawe",
  "login.submitting": "Kwinjira…",
  "login.noAccount": "Nta konti ufite?",
  "login.createAccount": "Fungura konti",

  // Register
  "register.title": "Fungura konti",
  "register.subtitle": "Iyandikishe kugira ngo utangire itsinda ryo kuzigama.",
  "register.name": "Amazina yombi",
  "register.email": "Imeri",
  "register.phone": "Numero ya telefone",
  "register.nationalId": "Numero y’indangamuntu",
  "register.password": "Ijambobanga",
  "register.passwordPlaceholder": "Nibura inyuguti 8",
  "register.confirmPassword": "Emeza ijambobanga",
  "register.confirmPasswordPlaceholder": "Ongera wandike ijambobanga ryawe",
  "register.submit": "Fungura konti",
  "register.haveAccount": "Usanzwe ufite konti?",
  "register.successTitle": "Konti yafunguwe.",
  "register.successBody":
    "Ubu, tegura itsinda ryawe ryo kuzigama. Uzaba umuyobozi waryo.",
  "register.createGroup": "Kora itsinda ryo kuzigama",
  "register.skip": "Ubu bireke · Injira",

  // Create group
  "createGroup.eyebrow": "Tangira itsinda ryo kuzigama",
  "createGroup.title": "Kora itsinda ryawe",
  "createGroup.step": "Intambwe ya {current} kuri {total} · {label}.",
  "createGroup.adminSuffix": "azaba umuyobozi w’itsinda.",
  "createGroup.stepDetails": "Amakuru y’itsinda",
  "createGroup.stepMeetings": "Inama",
  "createGroup.groupName": "Izina ry’itsinda",
  "createGroup.location": "Aho riherereye (si ngombwa)",
  "createGroup.savings": "Amafaranga yo kuzigama buri kwezi (RWF)",
  "createGroup.meetingDay": "Umunsi w’inama",
  "createGroup.chooseDay": "Hitamo umunsi",
  "createGroup.meetingTime": "Isaha y’inama",
  "createGroup.startDate": "Itariki yo gutangiriraho",
  "createGroup.back": "Garuka inyuma",
  "createGroup.continue": "Komeza",
  "createGroup.submit": "Kora itsinda",
  "createGroup.submitting": "Biri gukorwa…",
  "createGroup.backToSignUp": "Subira ku kwiyandikisha",
  "createGroup.signInAs": " · injira ukoresheje ",

  // Days
  "day.monday": "Kuwa mbere",
  "day.tuesday": "Kuwa kabiri",
  "day.wednesday": "Kuwa gatatu",
  "day.thursday": "Kuwa kane",
  "day.friday": "Kuwa gatanu",
  "day.saturday": "Kuwa gatandatu",
  "day.sunday": "Ku cyumweru",

  // Form validation
  "validation.emailInvalid": "Andika imeri yemewe.",
  "validation.passwordRequired": "Andika ijambobanga ryawe.",
  "validation.nameRequired": "Andika amazina yawe yombi.",
  "validation.phoneInvalid": "Andika numero yemewe, urugero 0788 123 456.",
  "validation.nationalIdInvalid":
    "Andika numero y’indangamuntu yawe y’imibare 16.",
  "validation.passwordShort": "Koresha nibura inyuguti 8.",
  "validation.confirmRequired": "Emeza ijambobanga ryawe.",
  "validation.passwordMismatch": "Amagambobanga ntabwo ahura.",
  "validation.groupNameShort":
    "Andika izina ry’itsinda ryawe (nibura inyuguti 2).",
  "validation.savingsRequired":
    "Andika amafaranga yo kuzigama buri kwezi.",
  "validation.savingsInvalid": "Andika umubare w’amafaranga wemewe muri RWF.",
  "validation.meetingDayRequired": "Hitamo umunsi w’inama.",
  "validation.meetingTimeRequired": "Hitamo isaha y’inama.",
  "validation.meetingTimeInvalid":
    "Koresha isaha y’amasaha 24, urugero 16:00.",
  "validation.startDateRequired": "Hitamo itariki yo gutangiriraho.",

  // Messages returned by the backend
  "api.network": "Seriveri ntibonetse. Ese irimo gukora?",
  "api.generic": "Hari ikitagenze neza.",
  "api.invalidCredentials": "Imeri cyangwa ijambobanga si byo!",
  "api.inactive": "Konti yawe cyangwa itsinda ryawe ntibikora!",
  "api.noCredentials": "Konti yawe nta ijambobanga riyiriho.",
  "api.validation": "Amakuru watanze ntabwo yemewe!",
  "api.groupEmailExists":
    "Hari itsinda risanzwe rikoresha iyi imeri y’umuyobozi!",
  "api.duplicateIdentity":
    "Imeri, numero ya telefone cyangwa indangamuntu bisanzwe bikoreshwa!",
  "api.server": "Seriveri yagize ikibazo!",
  "api.groupRegistered": "Itsinda ryo kuzigama ryanditswe neza!",

  // Dashboard
  "dashboard.welcome": "Murakaza neza, {name}.",
  "dashboard.totalSavings": "Amafaranga yawe yose wazigamye",
  "dashboard.thisMonth": "+ {amount} muri uku kwezi",
  "dashboard.group": "Itsinda ryawe",
  "dashboard.membersAndLocation": "Abanyamuryango {count} · {location}",
  "dashboard.monthlyContribution": "Umusanzu w’ukwezi",
  "dashboard.goalProgress": "{percent}% by’intego yawe ya {month}",
  "dashboard.savingsHistory": "Amateka y’ukuzigama",
  "dashboard.lastSixMonths": "Amezi 6 ashize · RWF",
  "dashboard.chartSeries": "Amafaranga yose yazigamwe",
  "dashboard.chartSummary":
    "Ukuzigama kwiyongereye kuva kuri {from} muri {fromMonth} kugera kuri {to} muri {toMonth}",
  "dashboard.goalEyebrow": "INTEGO Y’UKWEZI",
  "dashboard.toGo": "Hasigaye {amount}.",
  "dashboard.monthlyTarget": "Intego y’ukwezi: {amount}",
  "dashboard.recentActivity": "Ibyakozwe vuba",
  "dashboard.noContributions": "Nta musanzu uratangwa",
  "dashboard.contributionsFor": "Imisanzu ya {name}",
  "dashboard.colActivity": "Igikorwa",
  "dashboard.colDate": "Itariki",
  "dashboard.colAmount": "Umubare",
  "dashboard.colStatus": "Imiterere",

  // Navigation links for the management pages
  "nav.savings": "Ukuzigama kwanjye",
  "nav.groupPage": "Itsinda",
  "nav.members": "Abanyamuryango",
  "action.cancel": "Reka",

  // Savings
  "savings.title": "Ukuzigama kwanjye",
  "savings.record": "Andika umusanzu",
  "savings.total": "Amafaranga yose yazigamwe",
  "savings.thisMonth": "Uku kwezi",
  "savings.monthlyTarget": "Intego y’ukwezi",
  "savings.added": "Umusanzu wongeweho.",
  "savings.amount": "Umubare (RWF)",
  "savings.date": "Itariki",
  "savings.save": "Bika umusanzu",
  "savings.history": "Amateka y’imisanzu",
  "savings.empty": "Nta musanzu uratangwa",
  "savings.colDate": "Itariki",
  "savings.colAmount": "Umubare",
  "savings.colStatus": "Imiterere",
  "savings.recorded": "Byanditswe",
  "validation.amountInvalid":
    "Andika umubare w’amafaranga yuzuye ya RWF urenze zero.",
  "validation.dateInvalid":
    "Hitamo itariki yemewe itari iy’igihe kizaza.",
  "validation.amountTooLarge": "Uyu mubare ni munini cyane.",

  // Group page
  "group.members": "Abanyamuryango",
  "group.membersTitle": "Abanyamuryango b’itsinda",
  "group.manage": "Gucunga abanyamuryango",
  "group.noMembers": "Nta munyamuryango uraboneka",

  // Members
  "members.title": "Abanyamuryango",
  "members.count": "Abanyamuryango {count}",
  "members.add": "Ongeramo umunyamuryango",
  "members.new": "Umunyamuryango mushya",
  "members.name": "Amazina yombi",
  "members.phone": "Numero ya telefone",
  "members.added": "{name} yongewemo.",
  "members.search": "Shakisha abanyamuryango",
  "members.searchPlaceholder": "Shakisha izina cyangwa telefone",
  "members.filterStatus": "Yungurura ukurikije imiterere",
  "members.allStatuses": "Imiterere yose",
  "members.statusActive": "Arakora",
  "members.statusPending": "Ategerejwe",
  "members.statusInactive": "Ntakora",
  "members.colMember": "Umunyamuryango",
  "members.colRole": "Inshingano",
  "members.colStatus": "Imiterere",
  "members.colSavings": "Ukuzigama",
  "members.emptyNone": "Nta munyamuryango uraboneka",
  "members.emptyFiltered": "Nta munyamuryango uhuye n’ibyo wahisemo",
  "members.notFound": "Umunyamuryango ntabonetse",
  "members.backToList": "Subira ku banyamuryango",
  "members.details": "Amakuru y’umunyamuryango",
  "members.joined": "Yinjiye",
  "members.group": "Itsinda",
  "validation.memberInvalid":
    "Andika izina na numero ya telefone yemewe.",
  "validation.memberDuplicate":
    "Iyi numero ya telefone isanzwe ikoreshwa n’umunyamuryango.",

  // Sample data labels
  "fixture.monthlyContribution": "Umusanzu wo kuzigama w’ukwezi",
  "fixture.statusRecorded": "Byanditswe",
}
