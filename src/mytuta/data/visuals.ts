export const BLOCK_VISUALS = ["density_mass_volume", "solar_system", "fraction_parts", "ratio_groups", "percentage_grid", "equation_balance", "graph_reading", "photosynthesis_process", "forces_diagram", "series_circuit", "area_perimeter", "angle_turn"] as const;
export type BlockVisual = typeof BLOCK_VISUALS[number];
