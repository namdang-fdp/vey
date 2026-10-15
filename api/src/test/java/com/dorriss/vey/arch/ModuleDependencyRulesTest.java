package com.dorriss.vey.arch;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static org.assertj.core.api.Assertions.assertThat;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class ModuleDependencyRulesTest {
  private static final JavaClasses CLASSES =
      new ClassFileImporter()
          .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
          .importPackages("com.dorriss.vey");

  @Test
  void importsProductionClassesIncludingIam() {
    assertThat(CLASSES.contain("com.dorriss.vey.infrastructure.persistence.BaseEntity")).isTrue();
    assertThat(CLASSES.contain("com.dorriss.vey.common.health.HealthController")).isTrue();
    assertThat(CLASSES.contain("com.dorriss.vey.modules.iam.domain.entity.User")).isTrue();
    assertThat(CLASSES.contain("com.dorriss.vey.modules.iam.persistence.UserRepository")).isTrue();
  }

  @Test
  void infrastructureAndCommonDoNotDependOnBusinessModules() {
    noClasses()
        .that()
        .resideInAnyPackage("com.dorriss.vey.infrastructure..", "com.dorriss.vey.common..")
        .should()
        .dependOnClassesThat()
        .resideInAPackage("com.dorriss.vey.modules..")
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
        .check(CLASSES);
  }
}
