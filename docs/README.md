# Dossier Documentation CESIZen

Ce dossier rassemble les livrables documentaires du projet CESIZen Bloc 2
"Developper et tester les applications informatiques", rediges a partir du code
present dans ce depot au 2 avril 2026.

Important :
- ce dossier decrit l'existant reel du projet
- quand un element attendu par le sujet n'est pas encore implemente, il est
  marque comme `A faire` ou `Partiel`
- les choix techniques sont justifies par rapport au code actuel et a la cible
  CESIZen

## Sommaire

1. [Matrice de conformite](./01-matrice-conformite.md)
2. [Architecture logicielle](./02-architecture.md)
3. [Comparatif de 3 architectures](./03-comparatif-architectures.md)
4. [MCD et schema conceptuel](./04-mcd.md)
5. [MLD et schema relationnel](./05-mld.md)
6. [Guide d'installation et d'exploitation](./06-installation.md)
7. [Securite, RGPD et donnees sensibles](./07-securite-rgpd.md)
8. [Strategie de tests](./08-strategie-tests.md)
9. [Cahier de tests](./09-cahier-tests.md)
10. [Procedure de validation](./10-procedure-validation.md)
11. [Modele de PV de recette](./11-pv-recette-modele.md)

## Perimetre du projet

- module obligatoire 1 : Comptes utilisateurs
- module obligatoire 2 : Informations
- module au choix : Exercices de respiration
- application web : administration / back-office
- application mobile : front-office utilisateur
- backend : API Express + Prisma + PostgreSQL

## Arborescence technique du depot

- `back/` : API REST Express, logique metier, Prisma
- `web/` : back-office React/Vite pour les administrateurs
- `mobile/` : application Expo/React Native pour les utilisateurs
- `cesizen-api/` : client JavaScript partage pour consommer l'API

## Etat documentaire

Les documents ci-dessous sont suffisants pour constituer un dossier technique et
un dossier de validation presentables en soutenance. Ils restent a faire vivre
avec les prochaines evolutions fonctionnelles, en particulier :

- reset password
- formalisation HTTPS et secrets en production
- extension des tests web/mobile
- enrichissement du module respiration cote analytics
