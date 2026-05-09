<?php

namespace App\Http\Controllers;

use App\Models\Falta;
use Illuminate\Http\Request;

class FaltaController extends Controller
{
    public function index(Request $request)
    {
        $query = Falta::with('aluno');

        if ($request->has('aluno_id')) {
            $query->where('aluno_id', $request->aluno_id);
        }

        if ($request->has('data')) {
            $query->whereDate('data', $request->data);
        }

        return response()->json([
            'success' => true,
            'faltas' => $query->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'data' => 'required|date',
            'presente' => 'required|boolean'
        ]);

        $falta = Falta::create($request->all());

        return response()->json([
            'success' => true,
            'falta' => $falta->load('aluno')
        ], 201);
    }

    public function show(Falta $falta)
    {
        return response()->json([
            'success' => true,
            'falta' => $falta->load('aluno')
        ]);
    }

    public function update(Request $request, Falta $falta)
    {
        $request->validate([
            'presente' => 'boolean'
        ]);

        $falta->update($request->all());

        return response()->json([
            'success' => true,
            'falta' => $falta->load('aluno')
        ]);
    }

    public function destroy(Falta $falta)
    {
        $falta->delete();

        return response()->json([
            'success' => true,
            'message' => 'Falta deletada com sucesso'
        ]);
    }
}
