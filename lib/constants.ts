export const GENDER_OPTIONS = ["Male", "Female", "Other"];
export const PROGRAM_TYPE_OPTIONS = ["Emergency Assistance", "Resettlement", "Repatriation", "Local Integration"];
export const CATEGORY_OPTIONS = ["Refugee", "Asylum Seeker", "Stateless Person", "Migrant", "Internally Displaced Person (IDP)"];
export const RELIEF_OPTIONS = ["Rice", "Oil", "Cash", "Household Materials", "Others"];
export const REASON_OPTIONS = ["Guinea Land Dispute", "Business", "Family", "Employment", "Education", "Farming", "Seeking Asylum", "War", "Natural Disaster", "Other"];
export const TRAVEL_DOC_OPTIONS = ["National Passport", "Laissez-Passer", "Refugee Travel Document", "Other"];

export const COUNTIES = ["Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", "Montserrado", "Nimba", "River Gee", "Rivercess", "Sinoe"];

export const DISTRICTS_BY_COUNTY: Record<string, string[]> = {
    "Bomi": ["Dowein", "Klay", "Senjeh", "Suehn Mecca"],
    "Bong": ["Boinsen", "Fuamah", "Jorquelleh", "Kokoyah", "Kpaai", "Panta", "Salala", "Sanoyeah", "Suakoko", "Tukpahblee", "Yeallequelleh", "Zota"],
    "Gbarpolu": ["Belleh", "Bokomu", "Bopolu", "Gbarma", "Gounwolaila", "Kongba"],
    "Grand Bassa": ["Commonwealth2", "District #1", "District #2", "District #3", "District #4", "Neekreen", "Owensgrove", "St. John River City"],
    "Grand Cape Mount": ["Commonwealth", "Garwula", "Golakonneh", "Porkpa", "Tewor"],
    "Grand Gedeh": ["B'hai", "Cavala", "Gbao", "Gboe-Ploe", "Glio-Twarbo", "Konobo", "Putu", "Tchien"],
    "Grand Kru": ["Barclayville", "Bleebo", "Bolloh", "Buah", "Dorbor", "Dweh", "Felo-Jekwi", "Fenetoe", "Forpoh", "Garraway", "Gee", "Grand Cess Wedabo", "Kpi", "Lower Jloh", "Nrokwia-Wesldow", "Trenbo", "Upper Jloh", "Wlogba"],
    "Lofa": ["Foya", "Kolahun", "Quardu Boundi", "Salayea", "Vahun", "Voinjama", "Zorzor"],
    "Margibi": ["Firestone", "Gibi", "Kakata", "Mambah Kaba"],
    "Maryland": ["Gwelekpoken", "Harper", "Karluway #1", "Karluway #2", "Nyorken", "Pleebo/Sodoken", "Whojah"],
    "Montserrado": ["Careysburg", "Commonwealth1", "Greater Monrovia", "St. Paul River", "Todee"],
    "Nimba": ["Boe & Quilla", "Buu-Yao", "Doe", "Garr-Bain", "Gbehlay-Geh", "Gbi & Doru", "Gbor", "Kparblee", "Leewehpea-Mahn", "Meinpea-Mahn", "Sanniquellie Mahn", "Twan River", "Wee-Gbehyi-Mahn", "Yarmein", "Yarpea Mahn", "Yarwein Mehnsonnoh", "Zoe-Gbao"],
    "River Gee": ["Chedepo", "Gbeapo", "Glaro", "Karforh", "Nanee", "Nyenawliken", "Nyenebo", "Potupo", "Sarbo", "Tuobo"],
    "Rivercess": ["Beawor", "Central Rivercess", "Doedain", "Fen River", "Jo River", "Norwein", "Sam Gbalor", "Zarflahn"],
    "Sinoe": ["Bodae", "Bokon", "Butaw", "Dugbe River", "Greenville", "Jaedae", "Jeadepo", "Juarzon", "Kpayan", "Kulu Shaw Boe", "Plahn Nyarn", "Pynes Town", "Sanquin Dist#1", "Sanquin Dist#2", "Sanquin Dist#3", "Seekon", "Wedjah"]
};

export const ALL_DISTRICTS = Object.values(DISTRICTS_BY_COUNTY).flat().sort();

export const ALL_NATIONALITIES = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"].sort();