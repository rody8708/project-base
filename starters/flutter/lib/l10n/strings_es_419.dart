import '../domain/task.dart';
import 'strings.dart';

final class StringsEs419 implements AppStrings {
  const StringsEs419();

  @override
  String get appTitle => 'Base de escritorio y móvil';
  @override
  String get language => 'Idioma';
  @override
  String get example => 'Ejemplo reemplazable: tareas';
  @override
  String get memoryNotice =>
      'Solo en memoria. Los datos se pierden al cerrar la aplicación.';
  @override
  String get taskTitle => 'Título de la tarea';
  @override
  String get remoteNotice =>
      'Modo API. El backend guarda los datos. Si un cambio no se confirma, recarga antes de repetirlo.';
  @override
  String get add => 'Agregar';
  @override
  String get empty => 'No hay tareas. Agrega la primera.';
  @override
  String get reload => 'Volver a cargar';
  @override
  String get dismiss => 'Cerrar mensaje';
  @override
  String error(TaskIssue issue) => switch (issue) {
    TaskIssue.emptyTitle => 'Escribe un título antes de agregar una tarea.',
    TaskIssue.invalidTitle =>
      'Usa una sola línea, sin caracteres de control en el título.',
    TaskIssue.titleTooLong =>
      'El título supera el límite de 80 puntos de código Unicode.',
    TaskIssue.notFound =>
      'La tarea ya no está disponible. Vuelve a cargar la lista.',
    TaskIssue.unavailable =>
      'No se pudo confirmar la operación. Recarga antes de repetirla.',
  };
}
