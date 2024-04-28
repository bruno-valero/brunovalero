export default class Social {

    protected _email?:string;
    protected _whastsapp?:string;

    constructor({ email, whatsapp }:{ email?:string, whatsapp?:string }) {
        this._email = email;
        this._whastsapp = whatsapp;
    };

    email({ title, message, email }:{ title?:string, message?:string, email?:string }) {
        if (!email && ! this._email) throw new Error("Email não informado.");
        
        const emailSubject = encodeURIComponent(title ?? '');
        const emailBody = encodeURIComponent((message ?? '').replace(/  /g, ''));
        const url = `mailto:${this._email ?? email}?subject=${emailSubject}&body=${emailBody}`;

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank'; // Abre em uma nova aba

        // Simula o clique no link para abrir o documento em uma nova aba
        link.click();
    };

    whatsapp({ message, whastsapp }:{ message?:string, whastsapp?:string }) {
        if (!whastsapp && ! this._whastsapp) throw new Error("Email não informado.");

        const emailBody = encodeURIComponent((message ?? '').replace(/  /g, ''));
        const url = `https://wa.me/55${whastsapp ?? this._whastsapp}?text=${emailBody}`;

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank'; // Abre em uma nova aba

        // Simula o clique no link para abrir o documento em uma nova aba
        link.click();
    };



};