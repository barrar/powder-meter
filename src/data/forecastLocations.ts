export type ForecastLocationId =
  | "bachelor"
  | "timberline"
  | "mt-hood-meadows"
  | "mt-hood-skibowl"
  | "willamette-pass"
  | "hoodoo"
  | "anthony-lakes"
  | "mt-ashland"
  | "warner-canyon"
  | "cooper-spur"
  | "crystal-mountain"
  | "stevens-pass"
  | "summit-snoqualmie"
  | "alpental"
  | "mount-baker"
  | "white-pass"
  | "mission-ridge"
  | "forty-nine-degrees-north"
  | "bluewood"
  | "loup-loup"
  | "mammoth-mountain"
  | "palisades-tahoe"
  | "heavenly"
  | "northstar"
  | "kirkwood"
  | "sierra-at-tahoe"
  | "sugar-bowl"
  | "big-bear"
  | "mountain-high"
  | "june-mountain"
  | "park-city"
  | "deer-valley"
  | "snowbird"
  | "alta"
  | "solitude"
  | "brighton"
  | "snowbasin"
  | "powder-mountain"
  | "sundance"
  | "brian-head"
  | "vail"
  | "breckenridge"
  | "keystone"
  | "beaver-creek"
  | "aspen-snowmass"
  | "copper-mountain"
  | "steamboat"
  | "winter-park"
  | "arapahoe-basin"
  | "telluride";

export type ForecastState = "oregon" | "washington" | "california" | "utah" | "colorado";

export type ForecastStateOption = {
  id: ForecastState;
  label: string;
};

export type ForecastLocation = {
  id: ForecastLocationId;
  state: ForecastState;
  label: string;
  gridpoints: { office: string; x: number; y: number };
};

export const forecastStates: ForecastStateOption[] = [
  { id: "oregon", label: "Oregon" },
  { id: "washington", label: "Washington" },
  { id: "california", label: "California" },
  { id: "utah", label: "Utah" },
  { id: "colorado", label: "Colorado" },
];

export const defaultStateId: ForecastState = "oregon";

export const forecastLocations: ForecastLocation[] = [
  // Oregon
  {
    id: "bachelor",
    state: "oregon",
    label: "Mt. Bachelor",
    gridpoints: { office: "PDT", x: 23, y: 39 },
  },
  {
    id: "timberline",
    state: "oregon",
    label: "Timberline Lodge",
    gridpoints: { office: "PQR", x: 142, y: 89 },
  },
  {
    id: "mt-hood-meadows",
    state: "oregon",
    label: "Mt. Hood Meadows",
    gridpoints: { office: "PQR", x: 144, y: 88 },
  },
  {
    id: "mt-hood-skibowl",
    state: "oregon",
    label: "Mt. Hood Skibowl",
    gridpoints: { office: "PQR", x: 140, y: 88 },
  },
  {
    id: "willamette-pass",
    state: "oregon",
    label: "Willamette Pass",
    gridpoints: { office: "MFR", x: 145, y: 125 },
  },
  {
    id: "hoodoo",
    state: "oregon",
    label: "Hoodoo",
    gridpoints: { office: "PQR", x: 128, y: 48 },
  },
  {
    id: "anthony-lakes",
    state: "oregon",
    label: "Anthony Lakes",
    gridpoints: { office: "PDT", x: 144, y: 64 },
  },
  {
    id: "mt-ashland",
    state: "oregon",
    label: "Mt. Ashland",
    gridpoints: { office: "MFR", x: 108, y: 61 },
  },
  {
    id: "warner-canyon",
    state: "oregon",
    label: "Warner Canyon",
    gridpoints: { office: "MFR", x: 190, y: 52 },
  },
  {
    id: "cooper-spur",
    state: "oregon",
    label: "Cooper Spur",
    gridpoints: { office: "PQR", x: 146, y: 92 },
  },
  // Washington
  {
    id: "crystal-mountain",
    state: "washington",
    label: "Crystal Mountain",
    gridpoints: { office: "SEW", x: 145, y: 31 },
  },
  {
    id: "stevens-pass",
    state: "washington",
    label: "Stevens Pass",
    gridpoints: { office: "SEW", x: 165, y: 67 },
  },
  {
    id: "summit-snoqualmie",
    state: "washington",
    label: "The Summit at Snoqualmie",
    gridpoints: { office: "SEW", x: 152, y: 54 },
  },
  {
    id: "alpental",
    state: "washington",
    label: "Alpental",
    gridpoints: { office: "SEW", x: 152, y: 55 },
  },
  {
    id: "mount-baker",
    state: "washington",
    label: "Mount Baker",
    gridpoints: { office: "SEW", x: 158, y: 123 },
  },
  {
    id: "white-pass",
    state: "washington",
    label: "White Pass",
    gridpoints: { office: "SEW", x: 145, y: 17 },
  },
  {
    id: "mission-ridge",
    state: "washington",
    label: "Mission Ridge",
    gridpoints: { office: "OTX", x: 43, y: 89 },
  },
  {
    id: "forty-nine-degrees-north",
    state: "washington",
    label: "49 Degrees North",
    gridpoints: { office: "OTX", x: 141, y: 121 },
  },
  {
    id: "bluewood",
    state: "washington",
    label: "Bluewood",
    gridpoints: { office: "PDT", x: 165, y: 113 },
  },
  {
    id: "loup-loup",
    state: "washington",
    label: "Loup Loup",
    gridpoints: { office: "OTX", x: 68, y: 138 },
  },
  // California
  {
    id: "mammoth-mountain",
    state: "california",
    label: "Mammoth Mountain",
    gridpoints: { office: "REV", x: 57, y: 17 },
  },
  {
    id: "palisades-tahoe",
    state: "california",
    label: "Palisades Tahoe",
    gridpoints: { office: "REV", x: 28, y: 94 },
  },
  {
    id: "heavenly",
    state: "california",
    label: "Heavenly",
    gridpoints: { office: "REV", x: 36, y: 81 },
  },
  {
    id: "northstar",
    state: "california",
    label: "Northstar",
    gridpoints: { office: "REV", x: 32, y: 96 },
  },
  {
    id: "kirkwood",
    state: "california",
    label: "Kirkwood",
    gridpoints: { office: "STO", x: 91, y: 63 },
  },
  {
    id: "sierra-at-tahoe",
    state: "california",
    label: "Sierra-at-Tahoe",
    gridpoints: { office: "STO", x: 92, y: 69 },
  },
  {
    id: "sugar-bowl",
    state: "california",
    label: "Sugar Bowl",
    gridpoints: { office: "STO", x: 87, y: 93 },
  },
  {
    id: "big-bear",
    state: "california",
    label: "Big Bear Mountain Resort",
    gridpoints: { office: "SGX", x: 78, y: 78 },
  },
  {
    id: "mountain-high",
    state: "california",
    label: "Mountain High",
    gridpoints: { office: "LOX", x: 177, y: 56 },
  },
  {
    id: "june-mountain",
    state: "california",
    label: "June Mountain",
    gridpoints: { office: "REV", x: 56, y: 24 },
  },
  // Utah
  {
    id: "park-city",
    state: "utah",
    label: "Park City Mountain",
    gridpoints: { office: "SLC", x: 113, y: 169 },
  },
  {
    id: "deer-valley",
    state: "utah",
    label: "Deer Valley",
    gridpoints: { office: "SLC", x: 113, y: 167 },
  },
  {
    id: "snowbird",
    state: "utah",
    label: "Snowbird",
    gridpoints: { office: "SLC", x: 107, y: 166 },
  },
  {
    id: "alta",
    state: "utah",
    label: "Alta",
    gridpoints: { office: "SLC", x: 108, y: 166 },
  },
  {
    id: "solitude",
    state: "utah",
    label: "Solitude",
    gridpoints: { office: "SLC", x: 110, y: 168 },
  },
  {
    id: "brighton",
    state: "utah",
    label: "Brighton",
    gridpoints: { office: "SLC", x: 110, y: 167 },
  },
  {
    id: "snowbasin",
    state: "utah",
    label: "Snowbasin",
    gridpoints: { office: "SLC", x: 104, y: 196 },
  },
  {
    id: "powder-mountain",
    state: "utah",
    label: "Powder Mountain",
    gridpoints: { office: "SLC", x: 108, y: 203 },
  },
  {
    id: "sundance",
    state: "utah",
    label: "Sundance",
    gridpoints: { office: "SLC", x: 109, y: 157 },
  },
  {
    id: "brian-head",
    state: "utah",
    label: "Brian Head",
    gridpoints: { office: "SLC", x: 50, y: 42 },
  },
  // Colorado
  {
    id: "vail",
    state: "colorado",
    label: "Vail",
    gridpoints: { office: "GJT", x: 174, y: 121 },
  },
  {
    id: "breckenridge",
    state: "colorado",
    label: "Breckenridge",
    gridpoints: { office: "BOU", x: 25, y: 53 },
  },
  {
    id: "keystone",
    state: "colorado",
    label: "Keystone",
    gridpoints: { office: "BOU", x: 29, y: 58 },
  },
  {
    id: "beaver-creek",
    state: "colorado",
    label: "Beaver Creek",
    gridpoints: { office: "GJT", x: 168, y: 121 },
  },
  {
    id: "aspen-snowmass",
    state: "colorado",
    label: "Aspen Snowmass",
    gridpoints: { office: "GJT", x: 152, y: 103 },
  },
  {
    id: "copper-mountain",
    state: "colorado",
    label: "Copper Mountain",
    gridpoints: { office: "BOU", x: 22, y: 54 },
  },
  {
    id: "steamboat",
    state: "colorado",
    label: "Steamboat",
    gridpoints: { office: "GJT", x: 162, y: 159 },
  },
  {
    id: "winter-park",
    state: "colorado",
    label: "Winter Park",
    gridpoints: { office: "BOU", x: 37, y: 70 },
  },
  {
    id: "arapahoe-basin",
    state: "colorado",
    label: "Arapahoe Basin",
    gridpoints: { office: "BOU", x: 32, y: 59 },
  },
  {
    id: "telluride",
    state: "colorado",
    label: "Telluride",
    gridpoints: { office: "GJT", x: 116, y: 49 },
  },
];

export const defaultLocationId: ForecastLocationId = "bachelor";

export const getForecastState = (id?: string) => forecastStates.find((state) => state.id === id)?.id ?? defaultStateId;

export const getForecastLocation = (id?: string) => {
  const targetId = id ?? defaultLocationId;
  return forecastLocations.find((location) => location.id === targetId) ?? forecastLocations[0];
};

export const getForecastLocationsForState = (stateId: ForecastState) => forecastLocations.filter((location) => location.state === stateId);
