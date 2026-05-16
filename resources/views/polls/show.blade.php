<x-vue-app-layout>
    <x-slot:scripts>
        @vite(['resources/js/poll-show.js'])
    </x-slot>

    <x-slot:title>
        Voir le sondage
    </x-slot>

    <div id="app" data-props='@json([
        'token' => $token,
        'loginUrl' => route('login'),
    ])'></div>
</x-vue-app-layout>
