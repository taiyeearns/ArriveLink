/**
 * nigeria-locations.ts
 * Hardcoded list of all 36 Nigerian states + FCT, each with their major cities/towns.
 * This is the source of truth for the frontend dropdowns.
 */

export interface NigeriaState {
  name: string;
  cities: string[];
}

export const NIGERIA_STATES: NigeriaState[] = [
  { name: 'Abia', cities: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu', 'Bende', 'Isuikwuato'] },
  { name: 'Adamawa', cities: ['Yola', 'Mubi', 'Numan', 'Jimeta', 'Ganye', 'Girei'] },
  { name: 'Akwa Ibom', cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Abak', 'Ikot Abasi'] },
  { name: 'Anambra', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Aguata', 'Ihiala'] },
  { name: 'Bauchi', cities: ['Bauchi', 'Azare', 'Misau', 'Katagum', 'Alkaleri', 'Ningi'] },
  { name: 'Bayelsa', cities: ['Yenagoa', 'Brass', 'Sagbama', 'Ogbia', 'Nembe', 'Ekeremor'] },
  { name: 'Benue', cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Aliade', 'Vandeikya'] },
  { name: 'Borno', cities: ['Maiduguri', 'Biu', 'Dikwa', 'Gwoza', 'Bama', 'Monguno'] },
  { name: 'Cross River', cities: ['Calabar', 'Ogoja', 'Ikom', 'Obudu', 'Akamkpa', 'Obubra'] },
  { name: 'Delta', cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor', 'Abraka'] },
  { name: 'Ebonyi', cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ezza South', 'Ishielu', 'Ikwo'] },
  { name: 'Edo', cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Sabongida-Ora', 'Igarra'] },
  { name: 'Ekiti', cities: ['Ado Ekiti', 'Ikere Ekiti', 'Ilawe Ekiti', 'Ijero Ekiti', 'Omuo Ekiti', 'Ise Ekiti'] },
  { name: 'Enugu', cities: ['Enugu', 'Nsukka', 'Agbani', 'Oji River', 'Udi', 'Awgu'] },
  { name: 'FCT (Abuja)', cities: ['Abuja Central', 'Gwagwalada', 'Kuje', 'Bwari', 'Kwali', 'Abaji'] },
  { name: 'Gombe', cities: ['Gombe', 'Kaltungo', 'Bajoga', 'Kumo', 'Billiri', 'Nafada'] },
  { name: 'Imo', cities: ['Owerri', 'Orlu', 'Okigwe', 'Oguta', 'Mbaise', 'Ngor Okpala'] },
  { name: 'Jigawa', cities: ['Dutse', 'Hadejia', 'Gumel', 'Kazaure', 'Birnin Kudu', 'Ringim'] },
  { name: 'Kaduna', cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Kachia', 'Lere', 'Birnin Gwari'] },
  { name: 'Kano', cities: ['Kano City', 'Wudil', 'Rano', 'Dambatta', 'Bichi', 'Gaya'] },
  { name: 'Katsina', cities: ['Katsina', 'Daura', 'Funtua', 'Mashi', 'Malumfashi', 'Dutsin-Ma'] },
  { name: 'Kebbi', cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru', 'Bagudo', 'Jega'] },
  { name: 'Kogi', cities: ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Ankpa', 'Ayingba'] },
  { name: 'Kwara', cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Pategi', 'Lafiagi', 'Kaiama'] },
  { name: 'Lagos', cities: ['Ikeja', 'Lagos Island', 'Victoria Island', 'Lekki', 'Surulere', 'Oshodi', 'Mushin', 'Badagry', 'Epe', 'Ikorodu'] },
  { name: 'Nasarawa', cities: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa', 'Wamba', 'Doma'] },
  { name: 'Niger', cities: ['Minna', 'Bida', 'Suleja', 'Kontagora', 'Lapai', 'Agaie'] },
  { name: 'Ogun', cities: ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ilaro', 'Ota', 'Remo North'] },
  { name: 'Ondo', cities: ['Akure', 'Ondo Town', 'Owo', 'Okitipupa', 'Ikare', 'Idanre'] },
  { name: 'Osun', cities: ['Osogbo', 'Ile-Ife', 'Ilesha', 'Ede', 'Iwo', 'Inisa'] },
  { name: 'Oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo Town', 'Iseyin', 'Saki', 'Igboho'] },
  { name: 'Plateau', cities: ['Jos', 'Bukuru', 'Shendam', 'Pankshin', 'Langtang', 'Wase'] },
  { name: 'Rivers', cities: ['Port Harcourt', 'Bonny', 'Degema', 'Ahoada', 'Omoku', 'Eleme'] },
  { name: 'Sokoto', cities: ['Sokoto', 'Tambuwal', 'Gwadabawa', 'Illela', 'Bodinga', 'Wurno'] },
  { name: 'Taraba', cities: ['Jalingo', 'Wukari', 'Bali', 'Gassol', 'Ardo Kola', 'Takum'] },
  { name: 'Yobe', cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru', 'Geidam', 'Machina'] },
  { name: 'Zamfara', cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Anka', 'Maradun', 'Maru'] },
];

/** Returns cities for a given state name. Returns [] if state not found. */
export function getCitiesForState(stateName: string): string[] {
  const found = NIGERIA_STATES.find((s) => s.name === stateName);
  return found ? found.cities : [];
}

/** All state names as a flat string array */
export const STATE_NAMES: string[] = NIGERIA_STATES.map((s) => s.name);
