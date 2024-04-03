import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private _hubConnection: signalR.HubConnection

    constructor() {
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5281/tracker', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            }).build();
    }

    connect(): Observable<void> {
        return new Observable<void>(observer => {
            this._hubConnection
                .start()
                .then(() => {
                    observer.next()
                    observer.complete()
                })
                .catch(err => observer.error(err))
        })
    }

    stream<T>(remoteMethodName: string): Observable<T> {
        return new Observable<T>(observer => {
            this._hubConnection.on(remoteMethodName, (data: T) => observer.next(data))
        })
    }

    call<T>(remoteMethodName: string, data?: any): Observable<T> {
        let promise = data 
            ? this._hubConnection.invoke(remoteMethodName, data)
            : this._hubConnection.invoke(remoteMethodName)

        return new Observable(observer => {
            promise.then((data: T) => {
                    observer.next(data)
                    observer.complete()
                })
                .catch(err => observer.error(err))
        })
    }
}
