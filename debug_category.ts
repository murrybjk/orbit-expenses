
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://bjk.ai:7565';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY0MTU4MDA1LCJleHAiOjIwNzk1MTgwMDV9.zsVDPvxj9ZZxCm3Mz1YkylI8StZoodAzC4dDT-BwLro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    console.log("1. Testing Connection & Master Colors...");
    const { data: colors, error: colorError } = await supabase.from('master_colors').select('*');
    if (colorError) {
        console.error("❌ Error fetching colors:", colorError);
    } else {
        console.log(`✅ Found ${colors.length} colors.`);
        console.log("Sample color:", colors[0]);
    }

    console.log("\n2. Testing Master Icons...");
    const testIcon = "DebugIcon_" + Date.now();
    console.log(`Attempting to ensure icon '${testIcon}' exists...`);

    const { data: iconData, error: iconCheckError } = await supabase.from('master_icons').select('name').eq('name', testIcon).single();

    if (iconCheckError && iconCheckError.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error("❌ Error checking icon:", iconCheckError);
    }

    if (!iconData) {
        console.log("Icon not found, inserting...");
        const { error: insertError } = await supabase.from('master_icons').insert({ name: testIcon, label: testIcon });
        if (insertError) {
            console.error("❌ Error inserting icon:", insertError);
        } else {
            console.log("✅ Icon inserted.");
        }
    } else {
        console.log("✅ Icon already exists.");
    }

    console.log("\n3. Testing Category Creation...");
    const catId = "DEBUG_CAT_" + Date.now();
    const catData = {
        id: catId,
        label: "Debug Category",
        color_name: "Blue", // We know Blue exists from step 1 (hopefully)
        icon_name: testIcon
    };

    console.log("Inserting category:", catData);
    const { data: catResult, error: catError } = await supabase.from('categories').insert(catData).select();

    if (catError) {
        console.error("❌ Error creating category:", catError);
    } else {
        console.log("✅ Category created:", catResult);

        // Cleanup
        console.log("Cleaning up...");
        await supabase.from('categories').delete().eq('id', catId);
        await supabase.from('master_icons').delete().eq('name', testIcon);
    }
}

test();
