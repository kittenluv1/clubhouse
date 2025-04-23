import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/db.js';


export async function GET(req) {
    if (!supabase) {
        console.error("Supabase client is not initialized.");
        return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
    }

    try {
      const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
        method: "POST",
      });
 
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
 
      const data = await response.json();

        // make data into the correct format for supabase
        const orgList = data.orgList;

        // Sanitize a single object by removing null characters
        function sanitizeObject(obj) {
            const sanitizedObj = {};
            for (const key in obj) {
            if (typeof obj[key] === "string") {
                // Remove null characters from strings
                sanitizedObj[key] = obj[key].replace(/\u0000/g, "");
            } else {
                sanitizedObj[key] = obj[key];
            }
            }
            return sanitizedObj;
        }
       
        // Sanitize the entire orgList array
        const sanitizedOrgList = orgList.map(sanitizeObject);

        // Insert data into the Supabase database
        /* TO DO: SCHEDULE A CRON JOB TO MAKE THIS RUN ONCE A DAY */
        // const { error } = await supabase.from("clubs").insert(sanitizedOrgList);

        // if (error) {
        // console.error("Error inserting data into Supabase:", error);
        //  return new Response(JSON.stringify({ error: "Failed to insert data into database" }), { status: 500 });
        // }

      return new Response(JSON.stringify(data, null, 2), { status: 200 });
    } catch (error) {
      console.error("Error fetching data:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
    }
  }
