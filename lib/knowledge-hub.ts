// Knowledge Hub content: published French yield figures (Agreste, Terres Inovia) plus demo-only
// zone entries and discussion threads. Zone distributions and handles are NOT real farms.
export type Source = { n: string; title: string; short: string; url: string; used: string };
export type SourceKey = "agreste145" | "bilan" | "saa25" | "sojaSO" | "pleinchamp" | "agromatin" | "entraid" | "reussir" | "fevVar" | "sojaVar" | "occitanie";
export type Finding = { factor: string; text: string; src: SourceKey; you: "water" | "sow" | "soil" | "variety" | "—" };
export type CropRef = {
  key: string; label: string; fr: string; y25: number | null; y24?: number; a25?: number; a24?: number;
  nat?: SourceKey; reg?: { label: string; q: number; note: string; src: SourceKey }; vars: string[]; findings: Finding[];
};
export type Reply = { handle: string; ago: string; body: string };
export type Thread = { id: number; crop: string; title: string; body: string; handle: string; ago: string; replies: Reply[] };

export const SRC: Record<SourceKey, Source> = {
 agreste145:{n:'01',title:'Agreste, Infos rapides Grandes cultures n°145 (Nov 2025)',short:'Agreste, Nov 2025',url:'https://www.agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/IraGcu25145/2025_145inforapgdescultures.pdf',used:'Field pea and faba bean area and yield, 2024 and 2025 (estimates as of 1 Nov 2025).'},
 bilan:{n:'02',title:'Agreste, Bilan conjoncturel 2025',short:'Agreste, Bilan 2025',url:'https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/BilanConj2025/Bilan_conjoncturel_2025.pdf',used:'Soybean area and yield, 2024 and 2025.'},
 saa25:{n:'03',title:'Agreste, Statistique agricole annuelle 2025, chiffres provisoires',short:'Agreste SAA 2025',url:'https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/Chd2605/cd2026-5_SAA2025-ProvisoireV2.pdf',used:'Lentil, chickpea and sweet lupin area and yield, 2024 and 2025.'},
 sojaSO:{n:'04',title:'Terres Inovia, Bilan de campagne soja 2025, Sud-Ouest',short:'Terres Inovia',url:'https://www.terresinovia.fr/fr/actualites/bilan-de-campagne-soja-2025-sud-ouest',used:'Regional soybean yields, dry vs irrigated results and sowing-date spread.'},
 pleinchamp:{n:'05',title:'Pleinchamp, Moisson 2025 : les protéagineux retrouvent des couleurs (citing Terres Inovia)',short:'Pleinchamp / Terres Inovia',url:'https://www.pleinchamp.com/actualite/moisson-2025-les-proteagineux-retrouvent-des-couleurs',used:'Spring pea yields by sowing date.'},
 agromatin:{n:'06',title:'Agro Matin, Protéagineux : premiers résultats 2024/2025 (citing Terres Inovia)',short:'Agro Matin / Terres Inovia',url:'https://www.agromatin.com/expertise-agronomie/essais-recherche/proteagineux-des-premiers-resultats-prometteurs-pour-la-campagne-2024-2025.html',used:'Winter vs spring pea and faba bean yield ranges, 2025.'},
 entraid:{n:'07',title:'Entraid, Récolte pois féverole 2025 (citing Terres Inovia)',short:'Entraid / Terres Inovia',url:'https://www.entraid.com/articles/recolte-pois-feverole-2025',used:'Causes of poor winter pea yields.'},
 reussir:{n:'08',title:'Réussir La Dépêche, Moisson 2025 : rebond des rendements en pois protéagineux',short:'Réussir / Terres Inovia',url:'https://www.reussir.fr/ladepeche/moisson-2025-rebond-des-rendements-en-pois-proteagineux',used:'Heat and water stress on spring faba beans during grain fill.'},
 fevVar:{n:'09',title:'Terres Inovia, Variétés de féverole d’hiver, synthèse 2025',short:'Terres Inovia variety trials',url:'https://www.myvar.fr/uploads/media/document/0001/02/5759b7849541f7f81bcaa8c86b68a52b300bb047.pdf',used:'Winter faba bean variety trial average, 2025.'},
 sojaVar:{n:'10',title:'Terres Inovia, Synthèse nationale des essais variétés soja 2025',short:'Terres Inovia soy trials',url:'https://www.myvar.fr/uploads/media/document/0001/02/d239cdff8330ef752b24ac4ccd16ca956a273a50.pdf',used:'Soybean yield ranges in Auvergne-Rhône-Alpes, dry vs irrigated.'},
 occitanie:{n:'11',title:'DRAAF Occitanie, La filière légumes en Occitanie, Agreste Études n°3 (June 2024)',short:'DRAAF Occitanie',url:'https://draaf.occitanie.agriculture.gouv.fr/la-filiere-legumes-en-occitanie-agreste-etudes-no3-juin-2024-a9153.html',used:'Growth of chickpea and lentil area in Occitanie, 2010–2022.'}
};

export const CROPS: CropRef[] = [
 {key:'soy',label:'Soybeans',fr:'Soja',y25:25.8,y24:26.1,a25:150000,a24:153000,nat:'bilan',reg:{label:'Sud-Ouest 2025',q:29,note:'ex-Aquitaine + Midi-Pyrénées, 63,000 ha',src:'sojaSO'},vars:['ES Comandor','Sheila'],
  findings:[{factor:'Irrigation',text:'In ex-Aquitaine, irrigated soy averaged about 39 q/ha against about 16 q/ha for dry plots in 2025.',src:'sojaSO',you:'water'},
   {factor:'Irrigation',text:'In ex-Midi-Pyrénées, dry plots gave 7–15 q/ha against 20–45 q/ha irrigated.',src:'sojaSO',you:'water'},
   {factor:'Sowing date',text:'Sowing ran from mid-April to early June after a wet spring, which added to yield variability.',src:'sojaSO',you:'sow'},
   {factor:'Region',text:'In Auvergne-Rhône-Alpes, trial yields ranged 20–33 q/ha dry and up to 47 q/ha irrigated.',src:'sojaVar',you:'—'}]},
 {key:'pea',label:'Field peas',fr:'Pois protéagineux',y25:36.0,y24:29.2,a25:150000,a24:166000,nat:'agreste145',vars:['Furious','Kayanne'],
  findings:[{factor:'Sowing date',text:'Spring peas sown early yielded 40–55 q/ha; late-sown plots gave 20–30 q/ha.',src:'pleinchamp',you:'sow'},
   {factor:'Pea type',text:'Winter pea averaged 40–45 q/ha nationally in 2025, spring pea 35–40 q/ha.',src:'agromatin',you:'—'},
   {factor:'Soil water',text:'The rare poor winter pea results were linked to winter waterlogging.',src:'entraid',you:'soil'}]},
 {key:'faba',label:'Faba beans',fr:'Féverole',y25:26.7,y24:26.9,a25:112000,a24:80000,nat:'agreste145',vars:['Axel','GL Alice'],
  findings:[{factor:'Faba type',text:'Winter faba yielded around 30–35 q/ha in 2025, spring faba 25–30 q/ha.',src:'agromatin',you:'—'},
   {factor:'Heat stress',text:'Spring faba suffered from heat and water stress during grain fill.',src:'reussir',you:'water'},
   {factor:'Variety',text:'12 winter faba varieties averaged 39.8 q/ha across 12 post-registration trials in 2025.',src:'fevVar',you:'variety'}]},
 {key:'lentil',label:'Lentils',fr:'Lentilles',y25:15,y24:17,a25:33927,a24:31463,nat:'saa25',vars:['Anicia','Flora'],
  findings:[{factor:'Region',text:'Lentil area in Occitanie grew by about 2,000 ha between 2010 and 2022.',src:'occitanie',you:'—'}]},
 {key:'chickpea',label:'Chickpeas',fr:'Pois chiches',y25:16,y24:19,a25:27645,a24:29137,nat:'saa25',vars:['Elixir','Twist'],
  findings:[{factor:'Region',text:'Chickpea area in Occitanie grew by about 5,000 ha between 2010 and 2022.',src:'occitanie',you:'—'}]},
 {key:'lupin',label:'Lupins',fr:'Lupin doux',y25:22,y24:21,a25:3765,a24:4757,nat:'saa25',vars:['Orus','Feodora'],findings:[]},
 {key:'bean',label:'Dry beans',fr:'Haricots secs',y25:null,vars:['Tarbais','Lingot'],findings:[]},
 {key:'alfalfa',label:'Alfalfa / clover',fr:'Luzerne / trèfle',y25:null,vars:['Galaxie','Timbale'],findings:[]}
];

export const BY: Record<string, CropRef> = Object.fromEntries(CROPS.map((c) => [c.key, c]));
export const ZONE = { name: "Occitanie · coteaux argilo-calcaires" };
export const fmtN = (n: number) => n.toLocaleString("en-GB");

function rng(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
export const refT = (c: CropRef) => (c.reg ? c.reg.q / 10 : c.y25 ? c.y25 / 10 : ({ bean: 2.0, alfalfa: 9 } as Record<string, number>)[c.key]);
/** Demo-only synthetic zone entries (t/ha), deterministic per crop. */
export function entries(c: CropRef): number[] {
  const r = rng(c.key.length * 977 + c.key.charCodeAt(0) * 31 + 7);
  const base = refT(c), out: number[] = [];
  const n = 16 + Math.floor(r() * 18);
  for (let i = 0; i < n; i++) { const noise = r() + r() + r() - 1.5; out.push(Math.max(0.2, base * (1 + noise * 0.45))); }
  return out;
}

const ADJ = ["Coteau", "Lauragais", "Gers", "Garonne", "Tarn", "Causse", "Astarac", "Volvestre", "Comminges", "Quercy"];
const NOUN = ["Grive", "Merle", "Alouette", "Vanneau", "Pinson", "Huppe", "Milan", "Héron"];
export const handle = (i: number) => `${ADJ[i % ADJ.length]} ${NOUN[(i * 3) % NOUN.length]} ${11 + ((i * 17) % 80)}`;
export const ME = handle(42);

type SeedThread = { crop: string; title: string; body: string; h: number; ago: string; replies: { h: number; ago: string; body: string }[] };
const SEED_RAW: SeedThread[] = [
{crop:'soy',title:'Dry soy this summer: anyone get above 20 q/ha without irrigation?',body:'Sown 10 May on argilo-calcaire, no water. July and early August were brutal. Pods filled poorly on the slopes. Curious what dry growers in the zone ended up with.',h:0,ago:'2h',replies:[{h:1,ago:'1h',body:'Around 14 q/ha here, dry, sown late May. The irrigated block next door did more than double.'},{h:2,ago:'40m',body:'We only kept soy where we can give two waterings in August. Dry, it no longer pays for us.'}]},
{crop:'pea',title:'Spring peas: how early is too early on heavy soil?',body:'Results this year make a strong case for sowing early. On heavy clay I worry about getting on the field in February. What has worked for you?',h:3,ago:'5h',replies:[{h:4,ago:'3h',body:'We wait for a dry week rather than a date. Compaction from going in too wet cost us more than a late sowing.'},{h:5,ago:'2h',body:'Moved to winter peas on the heaviest fields. Avoids the spring problem entirely, but watch drainage.'}]},
{crop:'faba',title:'Winter vs spring faba after the June heat',body:'Our spring faba lost a lot during pod fill. Thinking of switching fully to winter faba. Any experience with Axel or GL Alice in this zone?',h:7,ago:'1d',replies:[{h:8,ago:'20h',body:'GL Alice held up well for us, sown deep, around 8 cm. Cold has not been an issue down here.'}]},
{crop:'chickpea',title:'Ascochyta on chickpeas after the May rain',body:'Seeing lesions spreading in the wetter corner of the field. Spray now or wait for drier weather?',h:9,ago:'1d',replies:[{h:10,ago:'22h',body:'We sprayed at first symptoms and it held. Waiting cost us a field two years ago.'}]},
{crop:'lentil',title:'Lentil harvest losses: header height and timing',body:'Plants are very low this year and we are losing pods at the cutter bar. What settings are people using?',h:12,ago:'2d',replies:[{h:13,ago:'2d',body:'Flex header, cutting as low as we dare, early morning while there is still some humidity.'}]},
{crop:'lupin',title:'Anyone still growing white lupin here?',body:'Considering lupin doux on a limestone-free field. Is anthracnose still the main risk?',h:14,ago:'3d',replies:[]}
];
export const SEED: Thread[] = SEED_RAW.map((t, i) => ({
  id: i, crop: t.crop, title: t.title, body: t.body, handle: handle(t.h), ago: t.ago,
  replies: t.replies.map((r) => ({ handle: handle(r.h), ago: r.ago, body: r.body })),
}));
