import '../domain/task.dart';
import 'strings_en_us.dart';
import 'strings_es_419.dart';

abstract interface class AppStrings {
  static AppStrings forLanguage(String languageCode) =>
      languageCode == 'en' ? const StringsEnUs() : const StringsEs419();

  String get appTitle;
  String get language;
  String get example;
  String get memoryNotice;
  String get remoteNotice;
  String get taskTitle;
  String get add;
  String get empty;
  String get reload;
  String get dismiss;
  String error(TaskIssue issue);
}
