'use client'

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ForecastLocation } from '../data/forecastLocations'

type LocationMenuProps = {
    locations: ForecastLocation[]
    value: ForecastLocation['id']
}

export default function LocationMenu({ locations, value }: LocationMenuProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleChange = (event: SelectChangeEvent) => {
        const nextLocation = event.target.value
        const params = new URLSearchParams(searchParams?.toString())
        params.set('location', String(nextLocation))
        const query = params.toString()
        router.push(query ? `/?${query}` : '/')
        router.refresh()
    }

    return (
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }}>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
                labelId="location-select-label"
                label="Location"
                value={value}
                onChange={handleChange}
            >
                {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                        {location.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
