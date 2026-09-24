package com.dorriss.vey.arch;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

class ModuleDependencyRulesTest {
  private static final JavaClasses CLASSES =
      new ClassFileImporter().importPackages("com.dorriss.vey");

  @Test
  void infrastructureAndCommonDoNotDependOnBusinessModules() {
    noClasses()
        .that()
        .resideInAnyPackage("com.dorriss.vey.infrastructure..", "com.dorriss.vey.common..")
        .should()
        .dependOnClassesThat()
        .resideInAPackage("com.dorriss.vey.modules..")
        .allowEmptyShould(true)
        .check(CLASSES);
  }

  @Test
  void businessModulesUsePublisherInsteadOfKafkaTemplate() {
    noClasses()
        .that()
        .resideInAPackage("com.dorriss.vey.modules..")
        .should()
        .dependOnClassesThat()
        .haveFullyQualifiedName("org.springframework.kafka.core.KafkaTemplate")
        .allowEmptyShould(true)
        .check(CLASSES);
  }
}
