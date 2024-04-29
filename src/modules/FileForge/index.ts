

type DataInfo = {
    name:string,
    size:number,
    type:string,
}

export default class FileForge {
    
    protected _file?:File;
    protected _data?:DataInfo;
    protected _blob?:Blob;
    protected _base64?:string;
    protected _rawData?:{type?:string, data:string};
    protected _filePath?:{type?:string, path:string};

    constructor({file, blob, base64, rawData, filePath}:{file?:File, blob?:Blob, base64?:string, dataInfo?:DataInfo, rawData?:{type?:string, data:string}, filePath?:{type?:string, path:string}}) {
        this._file = file;
        if (file) {
            this._data = {
                name:file.name,
                size:file.size,
                type:file.type,
            };
        };
        this._blob = blob;
        this._base64 = base64;
        this._rawData = rawData;
        this._filePath = filePath;
    };

    get fileData() {
        if (this._file) return this._data!;
        if (this._data) return this._data;
        return null;
    };


    async blob() {
        if (this._blob) return this._blob;
        if (this._base64) return this.base64toBlob(this._base64);
        if (this._rawData?.data) return this.rawDataToBlob(this._rawData.data, this._rawData.type);
        if (this._filePath?.path) {
            if (typeof window === 'undefined') {
                const blob = await this.filePathToBlob(this._filePath.path, this._filePath.type);
                if (blob) return blob;
                throw new Error("Não foi possível ler o caminho especificado");            
            }
        }
        if (!this._file) throw new Error("Não há versão base64, nem a versão de File bruta. Por isso não foi possível realizar a conversão");
        const blob = (await this.fileToBlob(this._file)) as Blob;
        this._blob = blob;
        return blob;
    }

    async blobFromData(rawData?:string) {
        const blob = await this.blob();
    }

    async url() {
        const blob = await this.blob();
        const url = URL.createObjectURL(blob);
        return url;
    };

    async open() {
        const url = await this.url();
        const link = document.createElement('a');
        link.href = url;
        // link.download = item.name; // Define o nome do arquivo ao fazer o download
        link.target = '_blank'; // Abre em uma nova aba

        // Simula o clique no link para abrir o documento em uma nova aba
        link.click();
    };

    async download(name?:string) {
        const url = await this.url();
        const link = document.createElement('a');
        link.href = url;
        link.download = name ?? 'Sem Nome'; // Define o nome do arquivo ao fazer o download
        link.target = '_blank'; // Abre em uma nova aba

        // Simula o clique no link para abrir o documento em uma nova aba
        link.click();
    }

    async base64() {
        if (this._base64) return this._base64;
        const blob = this._blob ? this._blob : await this.blob();
        const base64 = (await this.blobToDataURL(blob)) as string;
        return base64;
    }

    protected rawDataToBlob(rawData:string, type?:string) {
        const blob = new Blob([rawData], { type: type ?? 'application/octet-stream' });
        return blob;
    }

    protected fileToBlob(file:File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (!reader.result) {
                    reject(new Error('Não foi possível ler o arquivo!'));
                } else {
                    const blob = new Blob([reader.result], { type: file.type });                    
                    resolve(blob);
                }
            };
            reader.onerror = () => reject('O arquivo deve estar salvo no seu dispositivo.');
            reader.readAsArrayBuffer(file);
        });
    };

    protected async filePathToBlob(filePath:string, type?:string) {
        if (typeof window === 'undefined') {
            const fs = await import("fs")
            return new Promise<Blob | null>((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Cria um Blob a partir dos dados lidos
                    const blob = new Blob([data], { type: type ?? 'application/octet-stream' });
                    resolve(blob);
                });
            });
        };
    };

    protected async blobToDataURL(blob:Blob) {
        if (typeof window === 'undefined') {
            const arrayBuffer = await blob.arrayBuffer();            
            const buffer = Buffer.from(arrayBuffer)
            const base64String = buffer.toString('base64');
            return base64String;
        } else {
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const byteArray = Array.from(uint8Array);
            const base64String = btoa(String.fromCharCode.apply(null, byteArray));
            return base64String;
            // return new Promise((resolve, reject) => {
            //     const reader = new FileReader();
            //     reader.onload = () => {
            //         const base64 = reader.result;
            //         resolve(base64);
            //     };
            //     reader.onerror = reject;
            //     reader.readAsDataURL(blob);
            // });
        }
    };

    protected base64toBlob(dataURL:string) {
        const arr = dataURL.split(',');
        const mime = arr?.[0]?.match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

};