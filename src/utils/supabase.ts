import type { Record } from "./../domain/record";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const selectAllRecords = async (): Promise<Record[]> => {
  const { data, error } = await supabase.from("study-record").select("*");

  if (error) {
    console.error("Error fetching records:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    time: item.time,
  }));
};

export const insertRecord = async (
  title: string,
  time: number
): Promise<Record | null> => {
  const { data, error } = await supabase
    .from("study-record")
    .insert({ title, time })
    .select()
    .single();

  if (error) {
    console.error("Error inserting record:", error);
    return null;
  }

  return { id: data.id, title: data.title, time: data.time };
};

export const deleteRecord = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("study-record").delete().eq("id", id);
  if (error) {
    console.error("Error deleting record: ", error);
    return false;
  }
  return true;
};

export const updateRecord = async (
  id: string,
  title: string,
  time: number
): Promise<Record | null> => {
  const { data, error } = await supabase
    .from("study-record")
    .update({ title, time })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating record:", error);
    return null;
  }

  return { id: data.id, title: data.title, time: data.time };
};
