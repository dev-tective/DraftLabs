import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

export const Callback = () => {
    useEffect(() => {
        const completeLogin = async () => {
            // Verificar si estamos en un popup
            if (window.opener) {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (session && !error) {
                    // Enviar mensaje a la ventana principal
                    window.opener.postMessage("google-auth-success", window.location.origin);
                    // Cerrar el popup
                    window.close();
                    return;
                }
            }
        };

        completeLogin();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">
            <p>Conectando con Google...</p>
        </div>
    );
};