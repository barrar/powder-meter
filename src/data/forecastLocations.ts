export type ForecastLocation = {
    id: string
    label: string
    title: string
    description: string
    gridpoints: { office: string; x: number; y: number }
}

export const forecastLocations: ForecastLocation[] = [
    {
        id: 'bachelor',
        label: 'Mt. Bachelor',
        title: 'Mt. Bachelor snow forecast',
        description: 'A quick, visual snowfall outlook for Mt. Bachelor in Bend, Oregon',
        gridpoints: { office: 'PDT', x: 23, y: 39 },
    },
    {
        id: 'caribou-kcar',
        label: 'Caribou',
        title: 'Caribou snow forecast',
        description: 'A quick, visual snowfall outlook for Caribou Municipal Airport in Maine',
        gridpoints: { office: 'CAR', x: 71, y: 163 },
    },
]

export const getForecastLocation = (id?: string) => {
    const targetId = id ?? 'bachelor'
    return forecastLocations.find((location) => location.id === targetId) ?? forecastLocations[0]
}
