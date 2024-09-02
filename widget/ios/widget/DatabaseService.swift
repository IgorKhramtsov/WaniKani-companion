//
//  DatabaseService.swift
//  widget
//
//  Created by Igor Khramtsov on 25.08.2024.
//

import Foundation
import SQLite3

struct DatabaseService {
  private let appGroupId = "group.dev.khramtsov.wanikani"
  private let dbPath = "wanikani.db"

  private var db: OpaquePointer?

  init() {
    db = openDb()
  }

  func getReviewCountsByDate() -> [(Int, Int)] {
    var reviewCounts: [(Int, Int)] = []
    let query = """
    SELECT available_at, COUNT(*)
    FROM assignments
    WHERE srs_stage > 0
    GROUP BY available_at
    ORDER BY available_at
    """
    var statement: OpaquePointer?
    if sqlite3_prepare_v2(db, query, -1, &statement, nil) != SQLITE_OK {
      print("Failed to prepare statement")
      return []
    }
    while sqlite3_step(statement) == SQLITE_ROW {
      let date = Int(sqlite3_column_int(statement, 0))
      let count = Int(sqlite3_column_int(statement, 1))
      reviewCounts.append((date, count))
    }
    sqlite3_finalize(statement)
    return reviewCounts
  }

  private func openDb() -> OpaquePointer? {
    let fileManager = FileManager.default
    let directory = fileManager.containerURL(forSecurityApplicationGroupIdentifier: appGroupId)
    guard let dbFile = directory?.appendingPathComponent(dbPath) else {
      print("Failed to get database file path")
      return nil
    }
    var db: OpaquePointer?

    if sqlite3_open(dbFile.path, &db) != SQLITE_OK {
      print("Failed to open database")
      return nil
    } else {
      return db
    }

  }
}

