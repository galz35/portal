import 'package:flutter_test/flutter_test.dart';
import 'package:clinica_app/main.dart';

void main() {
  testWidgets('App loads correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const ClinicaApp());
    expect(find.text('Claro Mi Salud'), findsOneWidget);
  });
}
